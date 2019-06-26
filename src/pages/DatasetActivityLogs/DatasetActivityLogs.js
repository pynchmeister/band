import React from 'react'
import DatasetActivityLogsRender from './DatasetActivityLogsRender'

const mockdata = [
  {
    data: {
      key: 'THB/USD',
      provider: '0xDA7a79196DDD8AD788a996eFaFeA15bf0879c31c',
      signature: {
        r: '0xc1d94db49c2fbd4068938ef5693a78fe7ae6d404ec6fa1434b8df81991038a51',
        s: '0x2893ba0167360821775db363b4d5d94cd60231b09120f0b14da45052a90d6ede',
        v: 27,
      },
      tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
      timestamp: 1561521604,
      value: '32400000000000000',
    },
    id: 3300,
    key: 'THB/USD',
    tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
    type: 'REPORT',
  },
  {
    data: {
      key: 'GBP/USD',
      provider: '0xDa7Af1118c2C5F2edb0d452a84bE91E7b47014cb',
      signature: {
        r: '0x1a255a50aa84f5c5ec77cc1bbf8717d302775211ff627dc6098ef81dd8610215',
        s: '0x2aad070e5d1d45336afd6f5a42baa3264e1667749f1e05fa2dd5a942182b8fe9',
        v: 27,
      },
      tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
      timestamp: 1561521597,
      value: '1268872000000000000',
    },
    id: 3299,
    key: 'GBP/USD',
    tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
    type: 'REPORT',
  },
  {
    data: {
      key: 'CNY/USD',
      provider: '0xdA7aa2bbA8685F9C0dDBC53aB8e19A6A32dc8b7F',
      signature: {
        r: '0x869d511bce990fa3cd851a6d6abfd91b38efaddbc84b5af636000abb2cef9048',
        s: '0x1111523c8eda2cbc8d3da0f03a548f42f93878feef603b152295df479133786f',
        v: 28,
      },
      tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
      timestamp: 1561521589,
      value: '145148477457788288',
    },
    id: 3298,
    key: 'CNY/USD',
    tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
    type: 'REPORT',
  },
  {
    data: {
      key: 'EUR/USD',
      provider: '0xdA7a238d208eda262505D43678b7d7f180A9Ee69',
      signature: {
        r: '0x48e50faa0d706187b4e0e41f69f2a0f8dd0549ae6d7d50be8d7c52b079561aa8',
        s: '0x5e56f5c7013f0cef3c3050490566c8a488ed12c7a3ddda99bd8e7a37dbb150ab',
        v: 28,
      },
      tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
      timestamp: 1561521556,
      value: '1138799999965608192',
    },
    id: 3297,
    key: 'EUR/USD',
    tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
    type: 'REPORT',
  },
  {
    data: {
      key: 'JPY/USD',
      provider: '0xDa7Af1118c2C5F2edb0d452a84bE91E7b47014cb',
      signature: {
        r: '0xeff2afaeda4945a79bb38a175a703560285eece31c1d4f138fef0d47aa3ffeed',
        s: '0x2ae760af491f6feb1c2d858e8f9dc341294a9538b81a3f4cd96dec88a5d7ffc6',
        v: 27,
      },
      tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
      timestamp: 1561521530,
      value: '9307000000000000',
    },
    id: 3296,
    key: 'JPY/USD',
    tcd: '0xA360da6302d6e2E291e763Af5f6D929a1AB3f6A9',
    type: 'REPORT',
  },
]

class DatasetActivityLogs extends React.Component {
  componentDidMount() {
    // Load Logs from selector
  }

  render() {
    return <DatasetActivityLogsRender data={mockdata} />
  }
}

export default DatasetActivityLogs
