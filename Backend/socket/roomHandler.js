const User = require("../models/usermodel");
const Meeting = require("../models/meetingmodel");
const Project = require("../models/projectmodel");
const { DateTime } = require('luxon');
const { createNotification } = require("../socket/notificationHandler");

const roomSockets = new Map();

const roomHandler = (socket) => {

    socket.on('create-room', async ({projectId, roomName, newMeetType, newMeetDate, newMeetTime, keyPoints})=>{
        // console.log(keyPoints);
        // Remove the last key point if it's empty
const modifiedKeyPoints = keyPoints[keyPoints.length - 1] === "" ? keyPoints.slice(0, -1) : keyPoints;

const keyPointsWithOutcome = modifiedKeyPoints.map(point => ({
  keypoint: point,
  outcome: [] // Initialize the outcome array for each key point
}));
        
        // console.log(keyPointsWithOutcome);
        console.log(newMeetDate, newMeetTime);

        const dateTimeString = `${newMeetDate} ${newMeetTime}`;
        const dateTime = DateTime.fromFormat(dateTimeString, 'yyyy-MM-dd HH:mm');
        const isoString = dateTime.toUTC().toISO();
        // const dateTime = new Date(dateTimeString);
        console.log(isoString);
        let baseDate;
        if (newMeetType === "instant") {
            baseDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // Add 2 hours in milliseconds
        } else if (newMeetType === "scheduled") {
            const isoDateTime = DateTime.fromISO(isoString); // Parse ISO string to DateTime object
            baseDate = isoDateTime.plus({ hours: 3 }).toJSDate(); // Add 3 hours to the parsed DateTime object
            const project = await Project.findById(projectId);
            project.members.map((member) => {
                createNotification(member, `Leader: scheduled meeting in project ${project.title} at ${dateTime}`)
            })
        }
        const userId = await User.findOne({ 'email.address': socket.user.email }).select('_id');
        // console.log(userId);
        const newMeeting = new Meeting({
            projectId: projectId,
            title: roomName,
            // host: userId,
            meetType: newMeetType,
            startDate: baseDate,
            // startTime: newMeetTime,
            keypoints: keyPointsWithOutcome, // Add the modified key points array
            participants: [],
            currentParticipants: []
        });
        const room = await newMeeting.save();
        await socket.emit("room-created", {roomId: room._id, type: room.meetType});
    });
    
    socket.on('join-room', async ({roomId})=>{
        const userId = await User.findOne({ 'email.address': socket.user.email }).select('_id');
        // console.log(`user joind with email: ${socket.user.email} and id: ${userId._id}`);
        const meeting = await Meeting.findOne({_id: roomId.id});
        const project = await Project.findById(meeting.projectId);
        if ((project.members.includes(userId._id) || `${project.leaderID}` == `${userId._id}`) && !meeting.ended) {
        await Meeting.updateOne({_id: roomId.id}, {$addToSet: {participants: userId}});
        await Meeting.updateOne({_id: roomId.id}, {$addToSet: {currentParticipants: userId}});
        await socket.join(roomId);
        // console.log(`User : ${userId._id} joined room: ${roomId.id}`);
        await socket.emit("user-joined");
        // Add socket to roomSockets map
        if (!roomSockets.has(roomId.id)) {
          roomSockets.set(roomId.id, []);
        }
        const socketsInRoom = roomSockets.get(roomId.id);
        if (!socketsInRoom.includes(socket.id)) {
          socketsInRoom.push(socket.id);
        }
        console.log("roomsockets ", roomSockets);
        socket.emit("participants", {roomId: roomId});
        if (roomSockets.has(roomId.id)) {
            const ids = roomSockets.get(roomId.id);
            ids.forEach((id) => {
                socket.to(id).emit("participants", {roomId: roomId});
            });
        }
        }
        }); 


    socket.on("get-participants", async ({roomId})=>{
        // console.log("backend change requested");
        const room = await Meeting.findOne({ _id: roomId.id });
        const roomName = room.title;
        const participants = room.currentParticipants;
        const emails = {};
        // console.log('participants ', room.currentParticipants);

        const leaderId = await Project.findOne({ _id: room.projectId }).select("+leaderID");
        const userId = await User.findOne({ 'email.address': socket.user.email });

        const users = await User.find(
            { _id: { $in: participants } },
            { _id: 1, 'email.address': 1 }
          ).exec();
        //   console.log(users);
        
        users.forEach(user => {
            const { _id, email } = user;
            emails[ _id.valueOf()] = email;
        });
        
        socket.emit("participants-list", {emails, roomName, leaderId: leaderId.leaderID, userID: userId._id, username: userId.name});
    })
    
    socket.on("user-left-room", async({roomId})=>{
        // console.log(roomId);
        const userId = await User.findOne({ 'email.address': socket.user.email }).select('_id');
        await Meeting.updateOne({_id: roomId.id}, {$pull: {currentParticipants: userId._id}});
        // await socket.leave(roomId);
        if (roomSockets.has(roomId.id)) {
            const socketsInRoom = roomSockets.get(roomId.id);
            const index = socketsInRoom.indexOf(socket.id);
            if (index !== -1) {
                socketsInRoom.splice(index, 1); // Remove the socket ID of the disconnected user
                if (socketsInRoom.length === 0) {
                    roomSockets.delete(roomId.id); // Remove the room entry if no sockets are left
                } else {
                    roomSockets.set(roomId.id, socketsInRoom); // Update the room entry with the modified array
                }
            }
        }        
        console.log("roomsockets ", roomSockets);
        socket.emit("participants", {roomId: roomId});
        // Broadcast to all sockets in the room that a participant has left
        if (roomSockets.has(roomId.id)) {
            const ids = roomSockets.get(roomId.id);
            ids.forEach((id) => {
            socket.to(id).emit("participants", {roomId: roomId});
            });
        }
    });

    // When the project leader ends the call, emit an "end-call" event to all users in the room
    socket.on("end-call", async ({ roomId }) => {
        await Meeting.updateOne(
            { _id: roomId.id },
            { $set: { currentParticipants: [], ended: true } }
          );          
        socket.emit("participants", {roomId: roomId});
        if (roomSockets.has(roomId.id)) {
            const ids = roomSockets.get(roomId.id);
            ids.forEach((id) => {
                socket.to(id).emit("end-call"); // Emit to all users in the room
                socket.to(id).emit("participants", {roomId: roomId});
            });
        }
        socket.emit("end-call"); // Emit to all users in the room
        // await socket.leave(roomId);
        if (roomSockets.has(roomId.id)) {
          roomSockets.delete(roomId.id); // Remove the room entry if no sockets are left
        }    
        // console.log(roomSockets);
    });

    socket.on("get-keypoints", async ({ roomId }) => {
        const room = await Meeting.findOne({ _id: roomId.id });
        if (room) {
            socket.emit("keypoints", { keypoints: room.keypoints });
        }
    });

    socket.on("update-outcomes", async ({ roomId, keyPoint, outcomes }) => {
        console.log( roomId.id, keyPoint, outcomes );
        try {
            // Find the meeting document by roomId and keypoint
            if (!outcomes) return;
            const Outcome = {
                outcome: outcomes,
            }
            const meeting = await Meeting.findOneAndUpdate(
                { _id: roomId.id, "keypoints._id": keyPoint },
                { $push: { "keypoints.$.outcomes": Outcome } },
                { new: true }
            );
    
            if (meeting) {
                console.log("Meeting updated successfully:", meeting);
                // You can emit an event or perform any other action here if needed
            } else {
                console.log("Meeting not found");
            }
            socket.emit("keypoints", { keypoints: meeting.keypoints });
            if (roomSockets.has(roomId.id)) {
                const ids = roomSockets.get(roomId.id);
                ids.forEach((id) => {
                    socket.to(id).emit("keypoints", { keypoints: meeting.keypoints });
                });
            }
        } catch (error) {
            console.error("Error updating meeting:", error);
            // Handle the error appropriately
        }
    });

    socket.on("update-keypoints", async ({ roomId, keypoint }) => {
        console.log(roomId, keypoint);
        try {
            if (!keypoint) return;
            const newkeypoint = {
                keypoint: keypoint,
                outcome: []
            }
            const meeting = await Meeting.findOneAndUpdate(
                { _id: roomId.id },
                { $push: { keypoints: newkeypoint } },
                { new: true }
            );
            if (!meeting) {
                console.log("Meeting not found");
            }
            socket.emit("keypoints", { keypoints: meeting.keypoints });
            if (roomSockets.has(roomId.id)) {
                const ids = roomSockets.get(roomId.id);
                ids.forEach((id) => {
                    socket.to(id).emit("keypoints", { keypoints: meeting.keypoints });
                });
            }
        } catch (error) {
            console.error("Error updating meeting:", error);
            // Handle the error appropriately
        }
    });

    socket.on("whocanjoin", async ({ projectId, roomId }) => {

    const project = await Project.findById(projectId).populate("members", "name email");    
    const user = await User.findOne({ _id: project.leaderID });

    // Initialize an empty array to store member names
    const memberNames = [];
    
    // Add the leader's name to the array
    memberNames.push({ email: user.email.address, name: user.name });

    // Loop through each member in the project
    for (const member of project.members) {
      // console.log(member);
      const memberUser = await User.findOne({ 'email.address': member.email.address });
      if (memberUser) {
        // Add the member's name to the array
        memberNames.push({ email: member.email.address, name: memberUser.name });
      }
    }

    console.log(memberNames);

    socket.emit("who-can-join", {memberNames: memberNames});
        if (roomSockets.has(roomId.id)) {
            const ids = roomSockets.get(roomId.id);
            ids.forEach((id) => {
                socket.to(id).emit("who-can-join", {memberNames: memberNames});
            });
        }
    });
    
}
module.exports = roomHandler;

// socket.on('user-code-join', async ({roomId})=>{
    //     const room = await Meeting.findOne({_id: roomId});
//     if(room){
//         await socket.emit("room-exists", {roomId});
//     }else{
//         socket.emit("room-not-exist");
//     }
// })

// socket.on('request-to-join-room', async ({roomId})=>{
//     const userId = await User.findOne({ 'email.address': socket.user.email }).select('_id');
//     const room = await Meeting.findById(roomId.id);
//     const project = await Project.findOne({_id: room.projectId});
//     if (userId == project.leaderID){
//         socket.emit('join-room',{roomId});
//     }
//     // else{
//     //     socket.emit("requesting-host", {userId});
//     //     socket.broadcast.to(roomId).emit('user-requested-to-join', {participantId: userId, hostId: room.host});
//     // } 
// });


// socket.on("update-username", async ({updateText, userId})=>{
//     await User.updateOne({ _id: userId }, { $set: {username: updateText} });
   
// })



// socket.on("fetch-my-meets", async({}) =>{
//     const userId = await User.findOne({ 'email.address': socket.user.email }).select('_id');
//     const meets = await Meeting.find({ _id: 1, title: 1, meetType: 1, startDate: 1 }).exec();
//     await socket.emit("meets-fetched", {myMeets: meets});
// })

// socket.on("delete-meet", async({roomId}) =>{
//     await Meeting.deleteOne({ _id: roomId })
//     socket.emit("room-deleted");
// })

// socket.on("update-meet-details", async({roomId, roomName, newMeetDate, newMeetTime}) =>{
//     const dateTimeString = `${newMeetDate} ${newMeetTime}`;
//     const dateTime = DateTime.fromFormat(dateTimeString, 'yyyy-MM-dd HH:mm');
//     const isoString = dateTime.toUTC().toISO();
//     // const dateTime = new Date(dateTimeString);
//     console.log(isoString);
//     let baseDate;
//     // if (newMeetType === 'instant') {
//     //     // If using Date.now(), add 2 hours
//     //     baseDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // Add 2 hours in milliseconds
//     // } else {
//         // If using isoString, add 3 hours
//         baseDate = new Date(isoString);
//         baseDate.setHours(baseDate.getHours() + 3); // Add 3 hours
//     // }
//     await Meeting.updateOne({ _id: roomId }, { $set: {title:roomName, startDate:newMeetDate} });
//     socket.emit("meet-details-updated");
// })




// socket.on('user-disconnected', async({roomId})=>{ 
//     const userId = await User.findOne({ 'email.address': socket.user.email }).select('_id');
//     console.log(`user: ${userId} left room ${roomId}`);
// })


// chat

// socket.on("new-chat", async ({msg, roomId})=>{
//     // await socket.to(roomId).emit("new-chat-arrived", {msg});
//     await socket.broadcast.emit("new-chat-arrived", {msg, room:roomId});
//     console.log('reciedfv');
// })