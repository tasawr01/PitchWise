import { createServer } from "http";
import { config } from "dotenv";
config({ path: ".env.local" });
import next from "next";
import { Server } from "socket.io";
import dbConnect from "./lib/db";
import Conversation from "./models/Conversation";
import Message from "./models/Message";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
    await dbConnect(); // Connect to DB on server start

    const httpServer = createServer(handle);

    const io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("join_conversation", (conversationId) => {
            socket.join(conversationId);
            console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
        });

        socket.on("send_message", async (data) => {
            // data matches Message model structure + conversationId
            // We can save to DB here for immediate persistence and then broadcast
            try {
                const { conversationId, sender, content, type } = data;

                // Create message
                const newMessage = await Message.create({
                    conversation: conversationId,
                    sender,
                    content,
                    type,
                    readBy: [sender.user] // Sender has read it
                });

                // Update conversation lastMessage
                await Conversation.findByIdAndUpdate(conversationId, {
                    lastMessage: newMessage._id,
                    $inc: { [`unreadCounts.${sender.user}`]: 0 } // Reset sender unread? No, other user unread?
                    // Logic for unread counts should be handled carefully.
                    // For now, let's just update lastMessage.
                });

                // Broadcast to room
                io.to(conversationId).emit("receive_message", newMessage);

                // Also emit notification if needed

            } catch (error) {
                console.error("Error saving message:", error);
                socket.emit("error", { message: "Failed to send message" });
            }
        });

        socket.on("typing", (data) => {
            socket.to(data.conversationId).emit("typing", data);
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    httpServer.listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
