import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
    text: { 
        type: String, 
        required: true
    }, 
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    Community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
    },
    CreatedAt: {
        type: Date,
        default: Date.now,
    },
    ParentId: {
        type: String,
    },
    children:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread',
        }
    ]

});

const Thread= mongoose.models.Thread || mongoose.model('Thread', threadSchema)
export default Thread;