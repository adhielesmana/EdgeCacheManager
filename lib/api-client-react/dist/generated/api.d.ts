import type { QueryKey, UseMutationOptions, UseMutationResult, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import type { CdnStats, CreateDomainBody, CreateOriginBody, Domain, DomainStats, DomainWithOrigins, ExchangeMobileAuthorizationCodeBody, ExchangeMobileAuthorizationCodeResponse, GetCurrentAuthUserResponse, HealthStatus, LogoutMobileSessionResponse, Origin, PurgeCacheBody, PurgeCacheResponse, UpdateDomainBody, UpdateOriginBody, UpdateUserBody, User } from "./api.schemas";
import { customFetch } from "../custom-fetch";
import type { ErrorType, BodyType } from "../custom-fetch";
type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];
/**
 * @summary Health check
 */
export declare const getHealthCheckUrl: () => string;
export declare const healthCheck: (options?: RequestInit) => Promise<HealthStatus>;
export declare const getHealthCheckQueryKey: () => readonly ["/api/healthz"];
export declare const getHealthCheckQueryOptions: <TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData> & {
    queryKey: QueryKey;
};
export type HealthCheckQueryResult = NonNullable<Awaited<ReturnType<typeof healthCheck>>>;
export type HealthCheckQueryError = ErrorType<unknown>;
/**
 * @summary Health check
 */
export declare function useHealthCheck<TData = Awaited<ReturnType<typeof healthCheck>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof healthCheck>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get current authenticated user
 */
export declare const getGetCurrentAuthUserUrl: () => string;
export declare const getCurrentAuthUser: (options?: RequestInit) => Promise<GetCurrentAuthUserResponse>;
export declare const getGetCurrentAuthUserQueryKey: () => readonly ["/api/auth/user"];
export declare const getGetCurrentAuthUserQueryOptions: <TData = Awaited<ReturnType<typeof getCurrentAuthUser>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetCurrentAuthUserQueryResult = NonNullable<Awaited<ReturnType<typeof getCurrentAuthUser>>>;
export type GetCurrentAuthUserQueryError = ErrorType<unknown>;
/**
 * @summary Get current authenticated user
 */
export declare function useGetCurrentAuthUser<TData = Awaited<ReturnType<typeof getCurrentAuthUser>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getCurrentAuthUser>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary List all users (superadmin only)
 */
export declare const getListUsersUrl: () => string;
export declare const listUsers: (options?: RequestInit) => Promise<User[]>;
export declare const getListUsersQueryKey: () => readonly ["/api/users"];
export declare const getListUsersQueryOptions: <TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListUsersQueryResult = NonNullable<Awaited<ReturnType<typeof listUsers>>>;
export type ListUsersQueryError = ErrorType<void>;
/**
 * @summary List all users (superadmin only)
 */
export declare function useListUsers<TData = Awaited<ReturnType<typeof listUsers>>, TError = ErrorType<void>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listUsers>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a user role (superadmin only)
 */
export declare const getUpdateUserUrl: (userId: string) => string;
export declare const updateUser: (userId: string, updateUserBody: UpdateUserBody, options?: RequestInit) => Promise<User>;
export declare const getUpdateUserMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        userId: string;
        data: BodyType<UpdateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
    userId: string;
    data: BodyType<UpdateUserBody>;
}, TContext>;
export type UpdateUserMutationResult = NonNullable<Awaited<ReturnType<typeof updateUser>>>;
export type UpdateUserMutationBody = BodyType<UpdateUserBody>;
export type UpdateUserMutationError = ErrorType<void>;
/**
 * @summary Update a user role (superadmin only)
 */
export declare const useUpdateUser: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateUser>>, TError, {
        userId: string;
        data: BodyType<UpdateUserBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateUser>>, TError, {
    userId: string;
    data: BodyType<UpdateUserBody>;
}, TContext>;
/**
 * @summary Exchange mobile auth code for session token
 */
export declare const getExchangeMobileAuthorizationCodeUrl: () => string;
export declare const exchangeMobileAuthorizationCode: (exchangeMobileAuthorizationCodeBody: ExchangeMobileAuthorizationCodeBody, options?: RequestInit) => Promise<ExchangeMobileAuthorizationCodeResponse>;
export declare const getExchangeMobileAuthorizationCodeMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
        data: BodyType<ExchangeMobileAuthorizationCodeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
    data: BodyType<ExchangeMobileAuthorizationCodeBody>;
}, TContext>;
export type ExchangeMobileAuthorizationCodeMutationResult = NonNullable<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>>;
export type ExchangeMobileAuthorizationCodeMutationBody = BodyType<ExchangeMobileAuthorizationCodeBody>;
export type ExchangeMobileAuthorizationCodeMutationError = ErrorType<unknown>;
/**
 * @summary Exchange mobile auth code for session token
 */
export declare const useExchangeMobileAuthorizationCode: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
        data: BodyType<ExchangeMobileAuthorizationCodeBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof exchangeMobileAuthorizationCode>>, TError, {
    data: BodyType<ExchangeMobileAuthorizationCodeBody>;
}, TContext>;
/**
 * @summary Logout mobile session
 */
export declare const getLogoutMobileSessionUrl: () => string;
export declare const logoutMobileSession: (options?: RequestInit) => Promise<LogoutMobileSessionResponse>;
export declare const getLogoutMobileSessionMutationOptions: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
export type LogoutMobileSessionMutationResult = NonNullable<Awaited<ReturnType<typeof logoutMobileSession>>>;
export type LogoutMobileSessionMutationError = ErrorType<unknown>;
/**
 * @summary Logout mobile session
 */
export declare const useLogoutMobileSession: <TError = ErrorType<unknown>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof logoutMobileSession>>, TError, void, TContext>;
/**
 * @summary List all domains
 */
export declare const getListDomainsUrl: () => string;
export declare const listDomains: (options?: RequestInit) => Promise<Domain[]>;
export declare const getListDomainsQueryKey: () => readonly ["/api/domains"];
export declare const getListDomainsQueryOptions: <TData = Awaited<ReturnType<typeof listDomains>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDomains>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listDomains>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListDomainsQueryResult = NonNullable<Awaited<ReturnType<typeof listDomains>>>;
export type ListDomainsQueryError = ErrorType<unknown>;
/**
 * @summary List all domains
 */
export declare function useListDomains<TData = Awaited<ReturnType<typeof listDomains>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listDomains>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Add a new domain
 */
export declare const getCreateDomainUrl: () => string;
export declare const createDomain: (createDomainBody: CreateDomainBody, options?: RequestInit) => Promise<Domain>;
export declare const getCreateDomainMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDomain>>, TError, {
        data: BodyType<CreateDomainBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createDomain>>, TError, {
    data: BodyType<CreateDomainBody>;
}, TContext>;
export type CreateDomainMutationResult = NonNullable<Awaited<ReturnType<typeof createDomain>>>;
export type CreateDomainMutationBody = BodyType<CreateDomainBody>;
export type CreateDomainMutationError = ErrorType<void>;
/**
 * @summary Add a new domain
 */
export declare const useCreateDomain: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createDomain>>, TError, {
        data: BodyType<CreateDomainBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createDomain>>, TError, {
    data: BodyType<CreateDomainBody>;
}, TContext>;
/**
 * @summary Get a domain by ID
 */
export declare const getGetDomainUrl: (domainId: number) => string;
export declare const getDomain: (domainId: number, options?: RequestInit) => Promise<DomainWithOrigins>;
export declare const getGetDomainQueryKey: (domainId: number) => readonly [`/api/domains/${number}`];
export declare const getGetDomainQueryOptions: <TData = Awaited<ReturnType<typeof getDomain>>, TError = ErrorType<void>>(domainId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDomain>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDomain>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDomainQueryResult = NonNullable<Awaited<ReturnType<typeof getDomain>>>;
export type GetDomainQueryError = ErrorType<void>;
/**
 * @summary Get a domain by ID
 */
export declare function useGetDomain<TData = Awaited<ReturnType<typeof getDomain>>, TError = ErrorType<void>>(domainId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDomain>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Update a domain
 */
export declare const getUpdateDomainUrl: (domainId: number) => string;
export declare const updateDomain: (domainId: number, updateDomainBody: UpdateDomainBody, options?: RequestInit) => Promise<Domain>;
export declare const getUpdateDomainMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDomain>>, TError, {
        domainId: number;
        data: BodyType<UpdateDomainBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateDomain>>, TError, {
    domainId: number;
    data: BodyType<UpdateDomainBody>;
}, TContext>;
export type UpdateDomainMutationResult = NonNullable<Awaited<ReturnType<typeof updateDomain>>>;
export type UpdateDomainMutationBody = BodyType<UpdateDomainBody>;
export type UpdateDomainMutationError = ErrorType<void>;
/**
 * @summary Update a domain
 */
export declare const useUpdateDomain: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateDomain>>, TError, {
        domainId: number;
        data: BodyType<UpdateDomainBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateDomain>>, TError, {
    domainId: number;
    data: BodyType<UpdateDomainBody>;
}, TContext>;
/**
 * @summary Delete a domain
 */
export declare const getDeleteDomainUrl: (domainId: number) => string;
export declare const deleteDomain: (domainId: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteDomainMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDomain>>, TError, {
        domainId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteDomain>>, TError, {
    domainId: number;
}, TContext>;
export type DeleteDomainMutationResult = NonNullable<Awaited<ReturnType<typeof deleteDomain>>>;
export type DeleteDomainMutationError = ErrorType<void>;
/**
 * @summary Delete a domain
 */
export declare const useDeleteDomain: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteDomain>>, TError, {
        domainId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteDomain>>, TError, {
    domainId: number;
}, TContext>;
/**
 * @summary List origin servers for a domain
 */
export declare const getListOriginsUrl: (domainId: number) => string;
export declare const listOrigins: (domainId: number, options?: RequestInit) => Promise<Origin[]>;
export declare const getListOriginsQueryKey: (domainId: number) => readonly [`/api/domains/${number}/origins`];
export declare const getListOriginsQueryOptions: <TData = Awaited<ReturnType<typeof listOrigins>>, TError = ErrorType<unknown>>(domainId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrigins>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof listOrigins>>, TError, TData> & {
    queryKey: QueryKey;
};
export type ListOriginsQueryResult = NonNullable<Awaited<ReturnType<typeof listOrigins>>>;
export type ListOriginsQueryError = ErrorType<unknown>;
/**
 * @summary List origin servers for a domain
 */
export declare function useListOrigins<TData = Awaited<ReturnType<typeof listOrigins>>, TError = ErrorType<unknown>>(domainId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof listOrigins>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Add an origin server to a domain
 */
export declare const getCreateOriginUrl: (domainId: number) => string;
export declare const createOrigin: (domainId: number, createOriginBody: CreateOriginBody, options?: RequestInit) => Promise<Origin>;
export declare const getCreateOriginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrigin>>, TError, {
        domainId: number;
        data: BodyType<CreateOriginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof createOrigin>>, TError, {
    domainId: number;
    data: BodyType<CreateOriginBody>;
}, TContext>;
export type CreateOriginMutationResult = NonNullable<Awaited<ReturnType<typeof createOrigin>>>;
export type CreateOriginMutationBody = BodyType<CreateOriginBody>;
export type CreateOriginMutationError = ErrorType<void>;
/**
 * @summary Add an origin server to a domain
 */
export declare const useCreateOrigin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof createOrigin>>, TError, {
        domainId: number;
        data: BodyType<CreateOriginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof createOrigin>>, TError, {
    domainId: number;
    data: BodyType<CreateOriginBody>;
}, TContext>;
/**
 * @summary Update an origin server
 */
export declare const getUpdateOriginUrl: (domainId: number, originId: number) => string;
export declare const updateOrigin: (domainId: number, originId: number, updateOriginBody: UpdateOriginBody, options?: RequestInit) => Promise<Origin>;
export declare const getUpdateOriginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrigin>>, TError, {
        domainId: number;
        originId: number;
        data: BodyType<UpdateOriginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof updateOrigin>>, TError, {
    domainId: number;
    originId: number;
    data: BodyType<UpdateOriginBody>;
}, TContext>;
export type UpdateOriginMutationResult = NonNullable<Awaited<ReturnType<typeof updateOrigin>>>;
export type UpdateOriginMutationBody = BodyType<UpdateOriginBody>;
export type UpdateOriginMutationError = ErrorType<void>;
/**
 * @summary Update an origin server
 */
export declare const useUpdateOrigin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof updateOrigin>>, TError, {
        domainId: number;
        originId: number;
        data: BodyType<UpdateOriginBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof updateOrigin>>, TError, {
    domainId: number;
    originId: number;
    data: BodyType<UpdateOriginBody>;
}, TContext>;
/**
 * @summary Delete an origin server
 */
export declare const getDeleteOriginUrl: (domainId: number, originId: number) => string;
export declare const deleteOrigin: (domainId: number, originId: number, options?: RequestInit) => Promise<void>;
export declare const getDeleteOriginMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteOrigin>>, TError, {
        domainId: number;
        originId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof deleteOrigin>>, TError, {
    domainId: number;
    originId: number;
}, TContext>;
export type DeleteOriginMutationResult = NonNullable<Awaited<ReturnType<typeof deleteOrigin>>>;
export type DeleteOriginMutationError = ErrorType<void>;
/**
 * @summary Delete an origin server
 */
export declare const useDeleteOrigin: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof deleteOrigin>>, TError, {
        domainId: number;
        originId: number;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof deleteOrigin>>, TError, {
    domainId: number;
    originId: number;
}, TContext>;
/**
 * @summary Purge cache for a domain
 */
export declare const getPurgeCacheUrl: (domainId: number) => string;
export declare const purgeCache: (domainId: number, purgeCacheBody?: PurgeCacheBody, options?: RequestInit) => Promise<PurgeCacheResponse>;
export declare const getPurgeCacheMutationOptions: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof purgeCache>>, TError, {
        domainId: number;
        data: BodyType<PurgeCacheBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationOptions<Awaited<ReturnType<typeof purgeCache>>, TError, {
    domainId: number;
    data: BodyType<PurgeCacheBody>;
}, TContext>;
export type PurgeCacheMutationResult = NonNullable<Awaited<ReturnType<typeof purgeCache>>>;
export type PurgeCacheMutationBody = BodyType<PurgeCacheBody>;
export type PurgeCacheMutationError = ErrorType<void>;
/**
 * @summary Purge cache for a domain
 */
export declare const usePurgeCache: <TError = ErrorType<void>, TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof purgeCache>>, TError, {
        domainId: number;
        data: BodyType<PurgeCacheBody>;
    }, TContext>;
    request?: SecondParameter<typeof customFetch>;
}) => UseMutationResult<Awaited<ReturnType<typeof purgeCache>>, TError, {
    domainId: number;
    data: BodyType<PurgeCacheBody>;
}, TContext>;
/**
 * @summary Get overall CDN statistics
 */
export declare const getGetStatsUrl: () => string;
export declare const getStats: (options?: RequestInit) => Promise<CdnStats>;
export declare const getGetStatsQueryKey: () => readonly ["/api/stats"];
export declare const getGetStatsQueryOptions: <TData = Awaited<ReturnType<typeof getStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getStats>>>;
export type GetStatsQueryError = ErrorType<unknown>;
/**
 * @summary Get overall CDN statistics
 */
export declare function useGetStats<TData = Awaited<ReturnType<typeof getStats>>, TError = ErrorType<unknown>>(options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
/**
 * @summary Get stats for a specific domain
 */
export declare const getGetDomainStatsUrl: (domainId: number) => string;
export declare const getDomainStats: (domainId: number, options?: RequestInit) => Promise<DomainStats>;
export declare const getGetDomainStatsQueryKey: (domainId: number) => readonly [`/api/domains/${number}/stats`];
export declare const getGetDomainStatsQueryOptions: <TData = Awaited<ReturnType<typeof getDomainStats>>, TError = ErrorType<void>>(domainId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDomainStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}) => UseQueryOptions<Awaited<ReturnType<typeof getDomainStats>>, TError, TData> & {
    queryKey: QueryKey;
};
export type GetDomainStatsQueryResult = NonNullable<Awaited<ReturnType<typeof getDomainStats>>>;
export type GetDomainStatsQueryError = ErrorType<void>;
/**
 * @summary Get stats for a specific domain
 */
export declare function useGetDomainStats<TData = Awaited<ReturnType<typeof getDomainStats>>, TError = ErrorType<void>>(domainId: number, options?: {
    query?: UseQueryOptions<Awaited<ReturnType<typeof getDomainStats>>, TError, TData>;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & {
    queryKey: QueryKey;
};
export {};
//# sourceMappingURL=api.d.ts.map