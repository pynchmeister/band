import React from 'react'

import { OrderPagination } from 'components/Pagination'

import { Flex, Text, Box } from 'ui/common'

import { colors } from 'ui'
import RichlistBody from './RichlistBody'

const RichlistHeader = () => (
  <Flex
    flexDirection="row"
    py={3}
    bg="#f5f7ff"
    style={{ minHeight: '60px' }}
    alignItems="center"
  >
    <Flex pl="30px" flex={1}>
      <Text color="#4a4a4a" fontSize="16px" fontWeight={500}>
        Balance
      </Text>
    </Flex>
    <Flex flex={1}>
      <Text color="#4a4a4a" fontSize="16px" fontWeight={500}>
        Address
      </Text>
    </Flex>
  </Flex>
)

export default ({
  options,
  selectedOption,
  onChange,
  communityAddress,
  currentPage,
  onChangePage,
  pageSize,
}) => (
  <Flex
    style={{ borderRadius: '10px' }}
    width={1}
    bg="white"
    flexDirection="column"
    pb={3}
  >
    <RichlistHeader />
    <RichlistBody
      communityAddress={communityAddress}
      isAll={selectedOption.value === 'all'}
      currentPage={currentPage}
      pageSize={pageSize}
    />
    <OrderPagination
      communityAddress={communityAddress}
      //isAll={selectedOption.value === 'all'}
      pageSize={pageSize}
      currentPage={currentPage}
      onChangePage={onChangePage}
    />
  </Flex>
)
