const { shouldFail } = require('openzeppelin-test-helpers');

const MockDataSource = artifacts.require('MockDataSource');
const MajorityAggTCD = artifacts.require(
  'MajorityAggTCD',
);
const QueryTCDMock = artifacts.require('QueryTCDMock');
const BandRegistry = artifacts.require('BandRegistry');
const BandMockExchange = artifacts.require('BandMockExchange');
const TCDFactory = artifacts.require('TCDFactory');
const CommunityFactory = artifacts.require('CommunityFactory');
const BandToken = artifacts.require('BandToken');
const BondingCurveExpression = artifacts.require('BondingCurveExpression');
const BondingCurve = artifacts.require('BondingCurve');
const CommunityToken = artifacts.require('CommunityToken');
const Parameters = artifacts.require('Parameters');

require('chai').should();

contract('MajorityAggTCD', ([_, owner, alice, bob, carol]) => {
  const key = web3.utils.padRight(web3.utils.asciiToHex('key1'), 64);
  const majorityValue = web3.utils.padRight(
    web3.utils.asciiToHex('Majority value'),
    64,
  );
  const outlierValue = web3.utils.padRight(
    web3.utils.asciiToHex('Outlier value'),
    64,
  );
  const outlierValue2 = web3.utils.padRight(
    web3.utils.asciiToHex('Outlier value2'),
    64,
  );
  beforeEach(async () => {
    this.band = await BandToken.new({ from: owner });
    await this.band.mint(owner, 100000000, { from: owner });
    this.exchange = await BandMockExchange.new(this.band.address, {
      from: owner,
    });
    this.tcdFactory = await TCDFactory.new();
    this.registry = await BandRegistry.new(
      this.band.address,
      this.exchange.address,
      { from: owner },
    );
    this.commFactory = await CommunityFactory.new(this.registry.address, {
      from: owner,
    });
    const testCurve = await BondingCurveExpression.new([1]);
    const data1 = await this.commFactory.create(
      'SDD',
      'SDD',
      testCurve.address,
      '0',
      '60',
      '5',
      '5',
      {
        from: owner,
      },
    );
    this.comm = await CommunityToken.at(data1.receipt.logs[2].args.token);
    this.curve = await BondingCurve.at(data1.receipt.logs[2].args.bondingCurve);
    this.params = await Parameters.at(data1.receipt.logs[2].args.params);
    await this.comm.addCapper(this.tcdFactory.address, { from: owner });

    const data2 = await this.tcdFactory.createTCD(
      web3.utils.fromAscii('data:'),
      data1.receipt.logs[2].args.bondingCurve,
      this.registry.address,
      data1.receipt.logs[2].args.params,
      false,
    );

    await this.params.setRaw(
      [
        web3.utils.fromAscii('data:min_provider_stake'),
        web3.utils.fromAscii('data:max_provider_count'),
        web3.utils.fromAscii('data:owner_revenue_pct'),
        web3.utils.fromAscii('data:query_price'),
        web3.utils.fromAscii('data:withdraw_delay'),
      ],
      [10, 3, '500000000000000000', 100, 0],
      { from: owner },
    );

    this.tcd = await MajorityAggTCD.at(
      data2.receipt.logs[0].args.tcd,
    );

    await this.band.transfer(alice, 10000000, { from: owner });
    await this.band.transfer(bob, 10000000, { from: owner });
    await this.band.transfer(carol, 10000000, { from: owner });
    // alice buy 1000 SDD
    const calldata1 = this.curve.contract.methods.buy(_, 0, 1000).encodeABI();
    await this.band.transferAndCall(
      this.curve.address,
      1000000,
      '0x' + calldata1.slice(2, 10),
      '0x' + calldata1.slice(138),
      { from: alice },
    );

    // owner buy 100 SDD
    await this.band.transferAndCall(
      this.curve.address,
      1000000,
      '0x' + calldata1.slice(2, 10),
      '0x' + calldata1.slice(138),
      { from: owner },
    );

    await this.band.transfer(this.exchange.address, 10000000, { from: owner });
    await this.exchange.setExchangeRate('1000000000000000000000', {
      from: owner,
    });

    this.queryMock = await QueryTCDMock.new(this.tcd.address);
  });
  context('No data provider', () => {
    it('should return status code NOT_AVAILABLE', async () => {
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });
  });
  context('Have 1 data provider', () => {
    beforeEach(async () => {
      this.dataProvider1 = await MockDataSource.new('Source 1', {
        from: owner,
      });
      await this.tcd.register(10, this.dataProvider1.address, { from: owner });
    });

    it('should return status NOT_AVAILABLE if not set value', async () => {
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });

    it('should return correct value and ok status', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(1);
      (await this.queryMock.result()).should.eq(majorityValue);
    });
  });

  context('Have 2 data providers', () => {
    beforeEach(async () => {
      this.dataProvider1 = await MockDataSource.new('Source 1', {
        from: owner,
      });
      await this.tcd.register(10, this.dataProvider1.address, { from: owner });
      this.dataProvider2 = await MockDataSource.new('Source 2', {
        from: owner,
      });
      await this.tcd.register(20, this.dataProvider2.address, { from: owner });
    });

    it('should return status NOT_AVAILABLE if no one set value', async () => {
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });

    it('should return status NOT_AVAILABLE if only 1 source set value', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });
    it('should return majority value and ok status if 2 data sources set same value', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider2.setBytes32(key, majorityValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(1);
      (await this.queryMock.result()).should.eq(majorityValue);
    });
    it('should return DISAGREEMENT status if 2 data sources set different value', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider2.setBytes32(key, outlierValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(3);
    });
  });

  context('Have 3 data providers', () => {
    beforeEach(async () => {
      this.dataProvider1 = await MockDataSource.new('Source 1', {
        from: owner,
      });
      await this.tcd.register(10, this.dataProvider1.address, { from: owner });
      this.dataProvider2 = await MockDataSource.new('Source 2', {
        from: owner,
      });
      await this.tcd.register(20, this.dataProvider2.address, { from: owner });
      this.dataProvider3 = await MockDataSource.new('Source 3', {
        from: owner,
      });
      await this.tcd.register(30, this.dataProvider3.address, { from: owner });
    });

    it('should return status NOT_AVAILABLE if no one set value', async () => {
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });

    it('should return status NOT_AVAILABLE if only 1 source set value', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });
    it('should return majority value and ok status if 2 data sources set same value', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider2.setBytes32(key, majorityValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(1);
      (await this.queryMock.result()).should.eq(majorityValue);
    });
    it('should return majority value and ok status if 2 data sources set same value', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider2.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider3.setBytes32(key, outlierValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(1);
      (await this.queryMock.result()).should.eq(majorityValue);
    });
  });

  context('Have 4 data providers', () => {
    const key = web3.utils.padRight(web3.utils.asciiToHex('key1'), 64);
    beforeEach(async () => {
      this.dataProvider1 = await MockDataSource.new('Source 1', {
        from: owner,
      });
      await this.tcd.register(10, this.dataProvider1.address, { from: owner });
      this.dataProvider2 = await MockDataSource.new('Source 2', {
        from: owner,
      });
      await this.tcd.register(20, this.dataProvider2.address, { from: owner });
      this.dataProvider3 = await MockDataSource.new('Source 3', {
        from: owner,
      });
      await this.tcd.register(30, this.dataProvider3.address, { from: owner });
      this.dataProvider4 = await MockDataSource.new('Source 4', {
        from: owner,
      });
      await this.tcd.register(40, this.dataProvider4.address, { from: owner });
    });

    it('should return status NOT_AVAILABLE if no one set value', async () => {
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });

    it('should return status NOT_AVAILABLE if only 1 source set value', async () => {
      await this.dataProvider2.setBytes32(key, majorityValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });
    it('should return status NOT_AVAILABLE if only 1 source in list set value', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider2.setBytes32(key, outlierValue, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(2);
    });
    it('should return majority value if source provider list changed', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider3.setBytes32(key, majorityValue, { from: owner });
      await this.tcd.vote(20, this.dataProvider1.address, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(1);
      (await this.queryMock.result()).should.eq(majorityValue);
    });
    it('should return return DISAGREEMENT', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider3.setBytes32(key, outlierValue, { from: owner });
      await this.tcd.vote(20, this.dataProvider1.address, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(3);
    });
    it('should return majority value correctly if source provider list changed ', async () => {
      await this.dataProvider1.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider2.setBytes32(key, outlierValue, { from: owner });
      await this.dataProvider3.setBytes32(key, majorityValue, { from: owner });
      await this.dataProvider4.setBytes32(key, outlierValue2, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(3);
      await this.tcd.vote(20, this.dataProvider1.address, { from: owner });
      await this.queryMock.query(key, { from: owner, value: 100 });
      (await this.queryMock.status()).toNumber().should.eq(1);
      (await this.queryMock.result()).should.eq(majorityValue);
    });
  });
});
