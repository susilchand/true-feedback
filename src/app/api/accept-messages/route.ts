import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/option";
import dbConnect from "@/lib/dbConnect";
import { User } from "next-auth";
import UserModel from "@/model/User";

export async function POST(req: Request) {
    await dbConnect();
    const session = await getServerSession(authOptions)
    const user: User = session?.user
    if (!session || !session.user) {

        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        });
    }

    const userId = user._id
    const { acceptMessages } = await req.json()

    try {

        const updateUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessage: acceptMessages }, { new: true })
        if (!updateUser) {

            return Response.json({
                success: false,
                message: "failed to update user status to accept messages"
            }, {
                status: 401
            });
        }
        else {
            return Response.json({
                success: true,
                message: "Message acceptance status updated successfully!"
            }, {
                status: 200
            });
        }
    } catch (error) {
        console.log("failed to update user status to accept messages")
        return Response.json({
            success: false,
            message: "failed to update user status to accept messages"
        }, {
            status: 500
        });
    }
}

export async function GET(req: Request) {

    await dbConnect();
    const session = await getServerSession(authOptions)
    const user: User = session?.user
    if (!session || !session.user) {

        return Response.json({
            success: false,
            message: "Not Authenticated"
        }, {
            status: 401
        });
    }

    const userId = user._id;
    try {
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {

            return Response.json({
                success: false,
                message: "User Not found"
            }, {
                status: 404
            });
        }
        else {
            return Response.json({
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessage
            }, {
                status: 200
            });
        }
    } catch (error) {
        console.log("failed to update user status to accept messages")
        return Response.json({
            success: false,
            message: "Error in getting message acceptance"
        }, {
            status: 500
        });
    }
}