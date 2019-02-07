import { connect } from 'react-redux'

import { withRouter } from 'react-router-dom'

import { noOrderSelector } from 'selectors/order'

import Pagination from 'components/Pagination'

const mapStateToProps = (state, { communityName, pageSize, isAll }) => ({
  numberOfPages: Math.ceil(
    noOrderSelector(state, {
      name: communityName,
      type: isAll,
    }) / pageSize,
  ),
})

export default withRouter(connect(mapStateToProps)(Pagination))
