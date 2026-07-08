import { reddit } from "@devvit/web/server";
import { OnCommentCreateRequest, OnCommentSubmitRequest, OnCommentUpdateRequest, OnPostCreateRequest, OnPostFlairUpdateRequest, OnPostSubmitRequest, OnPostUpdateRequest, T1, T3 } from "@devvit/web/shared";

export async function fixPostTriggerEvent<T extends OnPostSubmitRequest | OnPostCreateRequest | OnPostUpdateRequest | OnPostFlairUpdateRequest> (event: T): Promise<T> {
    const eventToReturn: T = { ...event };

    if (!eventToReturn.post || !eventToReturn.author) {
        return eventToReturn;
    }

    if (eventToReturn.author.name !== "[redacted]" && eventToReturn.post.selftext !== "[Removed by Reddit]") {
        return eventToReturn;
    }

    const post = await reddit.getPostById(eventToReturn.post.id as T3);

    if (post.body !== undefined) {
        eventToReturn.post.selftext = post.body;
    }

    eventToReturn.author.name = post.authorName;
    if (post.authorId) {
        eventToReturn.author.id = post.authorId;
    }

    return eventToReturn;
}

export async function fixCommentTriggerEvent<T extends OnCommentSubmitRequest | OnCommentCreateRequest | OnCommentUpdateRequest> (event: T): Promise<T> {
    const eventToReturn: T = { ...event };

    if (!eventToReturn.comment || !eventToReturn.author) {
        return eventToReturn;
    }

    if (eventToReturn.author.name !== "[redacted]" && eventToReturn.comment.body !== "[Removed by Reddit]") {
        return eventToReturn;
    }

    const comment = await reddit.getCommentById(eventToReturn.comment.id as T1);

    eventToReturn.comment.body = comment.body;

    eventToReturn.author.name = comment.authorName;
    if (comment.authorId) {
        eventToReturn.author.id = comment.authorId;
    }

    return eventToReturn;
}
