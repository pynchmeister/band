import React from 'react'
import { Flex, Text, H5 } from 'ui/common'
import Richlist from 'components/Richlist'
import TransferHistory from 'components/TransferHistory'
import OrderHistory from 'components/OrderHistory'
import { colors } from 'ui'
import { FormattedMessage } from 'react-intl'

export default class DetailHistory extends React.Component {
  state = {
    selectedTab: 0,
  }

  renderTab(text, tab) {
    const { selectedTab } = this.state
    return (
      <Flex
        onClick={() => this.setState({ selectedTab: tab })}
        mr={2}
        px={3}
        alignItems="center"
        style={{
          cursor: 'pointer',
          background: selectedTab === tab ? '#f6f9ff' : 'transparent',
          borderRadius: 20,
          height: 32,
        }}
      >
        <Text
          fontSize="14px"
          color={selectedTab === tab ? colors.blue.normal : undefined}
          fontWeight={selectedTab === tab ? '600' : undefined}
        >
          <FormattedMessage id={text}></FormattedMessage>
        </Text>
      </Flex>
    )
  }

  render() {
    const { selectedTab } = this.state
    const { tokenAddress, pageSize } = this.props
    return (
      <Flex
        style={{ borderRadius: '10px', border: 'solid 1px #e7ecff' }}
        flexDirection="column"
        bg="white"
        width={1}
      >
        <Flex
          width={1}
          alignItems="center"
          flexDirection="row"
          px="30px"
          style={{ height: 72 }}
        >
          <H5 mr={4} color="#393939">
            <FormattedMessage id="EXPLORE"></FormattedMessage>
          </H5>
          {this.renderTab('Rich List', 0)}
          {this.renderTab('Token Transfers', 1)}
          {this.renderTab('Orders', 2)}
        </Flex>
        <Flex>
          {selectedTab === 0 && (
            <Richlist tokenAddress={tokenAddress} pageSize={pageSize} />
          )}
          {selectedTab === 1 && (
            <TransferHistory tokenAddress={tokenAddress} pageSize={pageSize} />
          )}
          {selectedTab === 2 && (
            <OrderHistory tokenAddress={tokenAddress} pageSize={pageSize} />
          )}
        </Flex>
      </Flex>
    )
  }
}
