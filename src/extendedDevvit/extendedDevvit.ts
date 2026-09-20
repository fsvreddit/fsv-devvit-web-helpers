import * as protos from "@devvit/protos";
import { UserAboutResponse } from "@devvit/protos/types/devvit/plugin/redditapi/users/users_msg.js";
import { GetSubredditUsersByTypeOptions, ListingFetchOptions } from "@devvit/reddit";
import { getDevvitConfig } from "@devvit/shared-types/server/get-devvit-config.js";

export type RedditAPIPlugins = {
    NewModmail: protos.NewModmail;
    Widgets: protos.Widgets;
    ModNote: protos.ModNote;
    LinksAndComments: protos.LinksAndComments;
    Moderation: protos.Moderation;
    GraphQL: protos.GraphQL;
    Listings: protos.Listings;
    Flair: protos.Flair;
    Wiki: protos.Wiki;
    Users: protos.Users;
    PrivateMessages: protos.PrivateMessages;
    Subreddits: protos.Subreddits;
};

export type ExtendedDevvitLike = {
    redditAPIPlugins: RedditAPIPlugins;
    schedulerPlugin: protos.Scheduler;
    kvStorePlugin: protos.KVStore;
    redisPlugin: protos.RedisAPI;
    mediaPlugin: protos.MediaService;
    settingsPlugin: protos.Settings;
    realtimePlugin: protos.Realtime;
    userActionsPlugin: protos.UserActions;
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    use: <T>(plugin: protos.Definition) => T;
};

export class ExtendedDevvit implements ExtendedDevvitLike {
    constructor (private config: ReturnType<typeof getDevvitConfig>) {}

    get kvStorePlugin (): protos.KVStore {
        return this.config.use(protos.KVStoreDefinition);
    }

    get mediaPlugin (): protos.MediaService {
        return this.config.use(protos.MediaServiceDefinition);
    }

    get realtimePlugin (): protos.Realtime {
        return this.config.use(protos.RealtimeDefinition);
    }

    get redditAPIPlugins (): RedditAPIPlugins {
        return {
            NewModmail: this.config.use(protos.NewModmailDefinition),
            Widgets: this.config.use(protos.WidgetsDefinition),
            ModNote: this.config.use(protos.ModNoteDefinition),
            LinksAndComments: this.config.use(protos.LinksAndCommentsDefinition),
            Moderation: this.config.use(protos.ModerationDefinition),
            GraphQL: this.config.use(protos.GraphQLDefinition),
            Listings: this.config.use(protos.ListingsDefinition),
            Flair: this.config.use(protos.FlairDefinition),
            Wiki: this.config.use(protos.WikiDefinition),
            Users: this.config.use(protos.UsersDefinition),
            PrivateMessages: this.config.use(protos.PrivateMessagesDefinition),
            Subreddits: this.config.use(protos.SubredditsDefinition),
        };
    }

    get redisPlugin (): protos.RedisAPI {
        return this.config.use(protos.RedisAPIDefinition);
    }

    get schedulerPlugin (): protos.Scheduler {
        return this.config.use(protos.SchedulerDefinition);
    }

    get settingsPlugin (): protos.Settings {
        return this.config.use(protos.SettingsDefinition);
    }

    get userActionsPlugin (): protos.UserActions {
        return this.config.use(protos.UserActionsDefinition);
    }

    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    use <T> (plugin: protos.Definition): T {
        return this.config.use(plugin);
    }
}

const extendedDevvit = new ExtendedDevvit(getDevvitConfig());
export function getExtendedDevvit (): ExtendedDevvit {
    return extendedDevvit;
}

export async function getRawUserData (username: string, metadata: protos.Metadata): Promise<UserAboutResponse> {
    return getExtendedDevvit().redditAPIPlugins.Users.UserAbout({ username }, metadata);
}

export async function getRawListingData (postOrCommentIds: string[], metadata: protos.Metadata): Promise<protos.Listing> {
    return getExtendedDevvit().redditAPIPlugins.LinksAndComments.Info({ subreddits: [], thingIds: postOrCommentIds }, metadata);
}

export async function getRawPostData (thingIds: string[], metadata: protos.Metadata): Promise<protos.Listing> {
    return getRawListingData(thingIds, metadata);
}

export async function getRawCommentData (thingIds: string[], metadata: protos.Metadata): Promise<protos.Listing> {
    return getRawListingData(thingIds, metadata);
}

export async function getRawSubredditData (subredditName: string, metadata: protos.Metadata): Promise<protos.SubredditAboutResponse> {
    return getExtendedDevvit().redditAPIPlugins.Subreddits.SubredditAbout({ subreddit: subredditName }, metadata);
}

export async function setVote (id: string, dir: 1 | 0 | -1, metadata: protos.Metadata): Promise<void> {
    await getExtendedDevvit().redditAPIPlugins.LinksAndComments.Vote({ id, dir }, metadata);
}

export async function getRawUserWhereData (userWhereRequest: GetSubredditUsersByTypeOptions, fetchOptions: ListingFetchOptions, metadata: protos.Metadata): Promise<protos.Listing> {
    return getExtendedDevvit().redditAPIPlugins.Subreddits.AboutWhere({
        where: userWhereRequest.type,
        subreddit: userWhereRequest.subredditName,
        user: userWhereRequest.username,
        ...fetchOptions,
    }, metadata);
}
