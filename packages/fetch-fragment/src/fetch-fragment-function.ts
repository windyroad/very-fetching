import {type AwaitedFetchReturns} from '@windyroad/wrap-fetch';
import {type FragmentResponse} from './fragment-response';

export type FetchFragmentFunction<
	Arguments extends Parameters<typeof fetch> = Parameters<typeof fetch>,
	FetchImpl extends (
		...arguments_: Arguments
	) => Promise<
		Pick<Response, 'json' | 'body' | 'status' | 'statusText' | 'headers'>
	> = typeof fetch,
> = (
	...arguments_: Arguments
) => Promise<AwaitedFetchReturns<FetchImpl> | FragmentResponse>;
