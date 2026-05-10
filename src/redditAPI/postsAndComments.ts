import { Comment, Post, reddit } from "@devvit/web/server";
import { isT1, isT3, T1, T3 } from "@devvit/web/shared";

export function getPostOrCommentById (thingId: T1 | T3): Promise<Post | Comment> {
    if (isT1(thingId)) {
        return reddit.getCommentById(thingId);
    } else if (isT3(thingId)) {
        return reddit.getPostById(thingId);
    } else {
        throw new Error(`Invalid thingId ${thingId}`);
    }
}
