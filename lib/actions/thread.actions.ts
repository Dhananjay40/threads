"use server"
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { skip } from "node:test";

interface Params {
    text: string,
    author: string,
    communityId: string | null,
    path: string,
}

export async function createThread({text, author, communityId, path}: Params){
    connectToDB();

    const createThread = await Thread.create({
        text, author, community: null,
    });

    // update user model by storing his thread is his schema
    await User.findByIdAndUpdate(author, {
        $push: { threads: createThread._id}
    })

    revalidatePath(path); // to immediately make changes on website
}

export async function fetchPosts(pageNumber = 1, pageSize = 20){
    connectToDB();
    // calculate the numbe rof posts to skip
    const skipAmount = (pageNumber -1)*pageSize;

    // fetch the posts that have no parents(top level threads)
    const postsQuery = Thread.find({ parentId: {$in: [null, undefined]}})
    .sort({ createdAt: 'desc'})
    .skip(skipAmount)
    .limit(pageSize)
    .populate({path: 'author', model: User})
        .populate({
            path: 'children',
            populate: {
                path: 'author',
                model: User,
                select: "_id name parentId image"
            }
    })

    const totalPostsCount = await Thread.countDocuments({parentId: {$in: [null, undefined]}})
    
    const posts = await postsQuery.exec();

    const isNext = totalPostsCount > skipAmount + posts.length;

    return {posts, isNext}


}

export async function fetchThreadById(id: string){
    connectToDB();
    try {
        //Todo: populate community later
        const thread = await Thread.findById(id)
        .populate({
            path: 'author',
            model: User,
            select: "_id id name image"
        })
        .populate({
            path: 'children',
            populate: [
                {
                    path: 'author',
                    model: User,
                    select: "_id id name parentId image"
                },
                {
                    path: "children",
                    model: Thread,
                    populate: {
                        path: 'author',
                        model: User,
                        select: "_id id name parentId image"
                    }
                }
            ]
        }).exec();

        return thread;
    } catch (error: any) {
        throw new Error(`Error fetching thread: $(error.message)`)
    }
}

export async function addCommentToThread(
    threadId: string, 
    commentText: string,
    userId: string,
    path: string,
){
    connectToDB();

    try {
        //adding a comment

        //first need to find original thread by its ID
        const originalThread = await Thread.findById(threadId);

        if(!originalThread){
            throw new Error("thread not found")
        }

        //create a new thread with the comment text
        const commentTherad = new Thread({
            text: commentText,
            author: userId,
            parentId: threadId,
        })
        //save the new thread
        const savedCommentThread = await commentTherad.save();

        //update the original thead to include the new comment
        originalThread.children.push(savedCommentThread._id)
        await originalThread.save();

        revalidatePath(path);

    } catch (error: any) {
        throw new Error(`Error adding comment to the thread: ${error.message}`)
    }
}