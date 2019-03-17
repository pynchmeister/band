import React from 'react'
import { Card, Flex, Box, Text } from 'ui/common'
import styled from 'styled-components'
import colors from 'ui/colors'

import ParameterInput from 'components/ParameterInput'

import { getUnitFromType, convertFromChain } from 'utils/helper'

const WhiteCard = styled(Card).attrs({
  variant: 'modal',
  width: '412px',
  mb: 3,
})`
  height: 200px;
`

export default ({ name, value, detail, isEdit, handleParameterChange }) => {
  const convertedValue = convertFromChain(
    value,
    detail.type,
    getUnitFromType(detail.type),
  )
  return (
    <WhiteCard>
      <Flex
        flexDirection="column"
        style={{ height: '100%', padding: '28px 40px 28px 16px' }}
      >
        <Text fontSize={0} fontWeight="bold" color={colors.purple.normal}>
          {name}
        </Text>
        {/* TODO: Mock description */}
        <Text color={colors.text.grey} fontSize={0} lineHeight={1.43} mt={3}>
          {detail.description}
        </Text>
        <Flex flex={1} />
        <Flex alignItems="center" py={2} mt={2}>
          <Text
            fontSize={0}
            fontWeight="bold"
            color={colors.purple.normal}
            mr={3}
          >
            Value:
          </Text>
          {isEdit ? (
            <ParameterInput
              value={convertedValue}
              type={detail.type}
              handleParameterChange={handleParameterChange}
            />
          ) : (
            <Text
              fontSize={0}
              width="80%"
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {convertedValue + ' ' + getUnitFromType(detail.type)}
            </Text>
          )}
        </Flex>
      </Flex>
    </WhiteCard>
  )
}
