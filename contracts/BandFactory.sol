pragma solidity 0.5.0;

import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

import "./BandToken.sol";
import "./CommunityCore.sol";
import "./CommunityToken.sol";
import "./Parameters.sol";
import "./VotingInterface.sol";

import "./factory/TokenFactory.sol";
import "./factory/ParametersFactory.sol";
import "./factory/CoreFactory.sol";


contract BandFactory is Ownable {
  event BandCreated(
    address bandAddress,
    address indexed owner,
    uint256 totalSupply
  );

  event CommunityCreated(
    uint256 nonce,
    address token,
    address parameter,
    address core
  );

  event NewVotingContractRegistered(
    address indexed voting
  );

  event VotingContractRemoved(
    address indexed voting
  );

  BandToken public band;
  CommunityCore[] public cores;

  TokenFactory public tokenFactory;
  ParametersFactory public parametersFactory;
  CoreFactory public coreFactory;

  mapping (address => bool) public verifiedVotingContracts;

  constructor(
    uint256 _totalSupply,
    TokenFactory _tokenFactory,
    ParametersFactory _parametersFactory,
    CoreFactory _coreFactory
  )
    public
  {
    band = new BandToken(_totalSupply, msg.sender);
    tokenFactory = _tokenFactory;
    parametersFactory = _parametersFactory;
    coreFactory = _coreFactory;

    emit BandCreated(address(band), msg.sender, _totalSupply);
  }

  function createNewCommunity(
    string calldata _name,
    string calldata _symbol,
    uint8 _decimals,
    VotingInterface _voting,
    bytes32[] calldata _keys,
    uint256[] calldata _values,
    uint256[] calldata _expressions
  )
    external
    returns(bool)
  {
    require(verifiedVotingContracts[address(_voting)]);
    CommunityToken token = tokenFactory.create(_name, _symbol, _decimals);
    Parameters params = parametersFactory.create(token, _voting, _keys, _values);
    CommunityCore core = coreFactory.create(band, token, params, _expressions);

    token.transferOwnership(address(core));
    cores.push(core);

    emit CommunityCreated(
      cores.length - 1,
      address(token),
      address(params),
      address(core));
    return true;
  }

  function addVotingContract(VotingInterface _voting)
    public
    onlyOwner
    returns(bool)
  {
    require(!verifiedVotingContracts[address(_voting)]);
    verifiedVotingContracts[address(_voting)] = true;
    emit NewVotingContractRegistered(address(_voting));
    return true;
  }

  function removeVotingContract(VotingInterface _voting)
    public
    onlyOwner
    returns(bool)
  {
    require(verifiedVotingContracts[address(_voting)]);
    verifiedVotingContracts[address(_voting)] = false;
    emit VotingContractRemoved(address(_voting));
    return true;
  }
}