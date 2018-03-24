import { awesomeFn } from "@quramy/x-core";
// import {foo} from '@quramy/x-core'
import foo from '@quramy/x-core/foo'

export function cli() {
  awesomeFn();
  foo()
  return Promise.resolve(true);
}
