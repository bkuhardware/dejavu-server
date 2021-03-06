const Conversation = require('../models/conversations');
const _ = require('lodash');

module.exports = {
    getConversations: async (userId, page, limit) => {
        try {
            let conversations
                = await Conversation.find({
                        users: userId
                    })
                    .populate('users', 'name avatar')
                    .populate('lastMessage', 'content seenAt userId')
                    .sort({ updatedAt: -1 })
                    .skip((page - 1) * limit)
                    .limit(limit).lean();
            conversations = _.map(conversations, conver => {
                const newConver = { ...conver };
                newConver.seen = conver.lastMessage && (conver.lastMessage.userId.equals(userId)|| conver.lastMessage.seenAt !== null);
                newConver.lastMessage = conver.lastMessage.content;
                const partner = _.find(newConver.users, u => !u._id.equals(userId));
                newConver.name = partner.name;
                newConver.avatar = partner.avatar;
                delete newConver.users;
                return newConver;
            });
            return {
                error: null,
                value: conversations
            };
        }
        catch (err) {
            return { error: err };
        }
    },
    checkConversation: async (userId, partnerId) => {
        try {
            const conversation
                = await Conversation.findOne()
                    .or([{ users: [userId, partnerId] }, { users: [partnerId, userId] }]);
            return { error: null, value: !!conversation };
        }
        catch (err) {
            return { error: err };
        }
    },
    getPartner: async (userId, converId) => {
        try {
            let conversation
                = await Conversation.findOne(
                    {
                        _id: converId,
                        users: userId
                    }
                ).populate('users', 'name avatar online').lean();
            if (!conversation)
                return { error: new Error('Invalid conversation!') };
            partner = _.find(conversation.users, u => !u._id.equals(userId));
            return {
                error: null,
                value: partner
            };
        }
        catch (err) {
            return { error: err };
        }
    }
}