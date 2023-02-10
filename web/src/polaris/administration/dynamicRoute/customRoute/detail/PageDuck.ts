import { createToPayload, reduceFromPayload } from 'saga-duck'
import DetailPage from '@src/polaris/common/ducks/DetailPage'
import { getAllList } from '@src/polaris/common/util/apiRequest'
import { describeComplicatedNamespaces } from '@src/polaris/namespace/model'
import { describeServices } from '@src/polaris/service/model'
import { put } from 'redux-saga/effects'
import { takeLatest } from 'redux-saga-catch'
import { CustomRoute, describeCustomRoute } from '../model'
import { Values } from '../operations/CreateDuck'

interface ComposedId {
  id: string
  namespace: string
  service: string
}

interface Data {
  namespaceList: { value: string; text: string }[]
  serviceList: { value: string; text: string; namespace: string }[]
}

export default class RouteDetailPageDuck extends DetailPage {
  ComposedId: ComposedId
  Data: Data

  get baseUrl() {
    return `/#/custom-route-detail`
  }

  get params() {
    const { types } = this
    return [
      ...super.params,
      {
        key: 'id',
        type: types.SET_ID,
        defaults: '',
      },
      {
        key: 'ns',
        type: types.SET_NAMESPACE,
        defaults: '',
      },
      {
        key: 'service',
        type: types.SET_SERVICE,
        defaults: '',
      },
    ]
  }

  get rawSelectors() {
    type State = this['State']
    return {
      ...super.rawSelectors,
      composedId: (state: State) => ({
        id: state.id,
        namespace: state.namespace,
        service: state.service,
      }),
    }
  }

  get quickTypes() {
    enum Types {
      SET_NAMESPACE,
      SET_SERVICE,
      SET_SOURCE_LABEL_LIST,
      SET_DESTINATION_LABEL_LIST,
      SUBMIT,
      SET_RULE_DETAIL,
    }
    return {
      ...super.quickTypes,
      ...Types,
    }
  }

  get quickDucks() {
    return {
      ...super.quickDucks,
    }
  }

  get creators() {
    const { types } = this
    return {
      ...super.creators,
      submit: createToPayload<void>(types.SUBMIT),
    }
  }

  get reducers() {
    const { types } = this
    return {
      ...super.reducers,
      ruleDetail: reduceFromPayload<Values>(types.SET_RULE_DETAIL, {} as Values),
      namespace: reduceFromPayload<string>(types.SET_NAMESPACE, ''),
      service: reduceFromPayload<string>(types.SET_SERVICE, ''),
      sourceLabelList: reduceFromPayload(types.SET_SOURCE_LABEL_LIST, []),
      destinationLabelList: reduceFromPayload(types.SET_DESTINATION_LABEL_LIST, []),
    }
  }

  *saga() {
    yield* super.saga()
    const { types } = this
    // 规则编辑
    yield takeLatest(types.SET_ID, function*(action) {
      if (action.payload) {
        let ruleDetailInfo = null
        const result = yield describeCustomRoute({
          id: action.payload,
          offset: 0,
          limit: 10,
        })
        result.list =
          result.totalCount > 0 &&
          result.list.map((item: CustomRoute) => ({
            ...item,
            source: {
              service: item.routing_config?.rules?.[0]?.sources?.[0].service,
              namespace: item.routing_config?.rules?.[0]?.sources?.[0].namespace,
            },
            destination: {
              service: item.routing_config?.rules?.[0].destinations?.[0]?.service,
              namespace: item.routing_config?.rules?.[0].destinations?.[0]?.namespace,
            },
            rules: item.routing_config.rules.map(rule => ({
              ...item,
              sources: rule.sources.map(source => ({
                ...source,
                arguments: source?.[0].arguments.map(item => ({
                  type: item.type,
                  key: item.key,
                  value_type: item.value.type,
                  value: item.value.value,
                })),
              })),
              destinations: rule.destinations.map(destination => ({
                ...destination,
                labels: Object.entries(destination.labels).map(([key, value]) => ({ key, ...value })),
              })),
            })),
          }))
        ruleDetailInfo = result.list[0]
        yield put({ type: types.SET_RULE_DETAIL, payload: ruleDetailInfo })
      }
    })
  }

  async getData() {
    const [namespaceOptions, serviceOptions] = await Promise.all([
      getAllList(describeComplicatedNamespaces, {
        listKey: 'namespaces',
        totalKey: 'amount',
      })({}),
      getAllList(describeServices, {})({}),
    ])

    const namespaceList = namespaceOptions.list.map(item => ({
      text: item.name,
      value: item.name,
    }))

    const serviceList = serviceOptions.list.map(item => ({
      text: item.name,
      value: item.name,
      namespace: item.namespace,
    }))
    return {
      namespaceList,
      serviceList,
    }
  }
}
