import {type AwaitedFetchReturns} from '@windyroad/wrap-fetch';
import {type FragmentResponse} from './fragment-response.js';

export type FetchFragmentFunction<
	Arguments extends any[] = Parameters<typeof fetch>,
	ResponseType extends Response = Response,
> = (
	...arguments_: Arguments
) => Promise<ResponseType | FragmentResponse<ResponseType>>;
