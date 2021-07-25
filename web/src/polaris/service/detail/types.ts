export enum TAB {
  Info = "info",
  Instance = "instance",
  Route = "route",
  RateLimit = "ratelimit",
  CircuitBreaker = "circuitBreaker",
}
export const TAB_LABLES = {
  [TAB.Info]: "服务信息",
  [TAB.Instance]: "服务实例",
  [TAB.Route]: "路由规则",
  [TAB.RateLimit]: "限流规则",
  [TAB.CircuitBreaker]: "熔断规则",
};

export interface ComposedId {
  name: string;
  namespace: string;
}
