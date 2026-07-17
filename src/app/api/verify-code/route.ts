import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

export async function POST(req: Request) {

    await dbConnect();

    try {

        const { username, code } = await req.json();
        const decodedUsername = decodeURIComponent(username);
        const user = await UserModel.findOneAndUpdate({
            username: decodedUsername
        })

        if (!user) {
            return Response.json({
                success: false,
                message: "User not found."
            }, {
                status: 404
            });
        }

        const isCodeValid = user.verifyCode === code;
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true;
            await user.save();
            return Response.json({
                success: true,
                message: "User verified successfully."
            }, {
                status: 200
            });

        }
        else if (!isCodeNotExpired) {
            return Response.json({
                success: false,
                message: "Verification code has expired.Please request a new code."
            }, {
                status: 400
            });
        }
        else {
            return Response.json({
                success: false,
                message: "Invalid verification code."
            }, {
                status: 400
            });
        }
    } catch (error) {
        console.error("Error checking username uniqueness:", error);
        return Response.json({
            success: false,
            message: "An error occurred while checking username uniqueness."

        },
            {
                status: 500
            })
    }
}