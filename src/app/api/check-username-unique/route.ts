import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schemas/signUpSchema";

const checkUsernameSchema = z.object({
    username: usernameValidation
})

export async function GET(req: Request) {


    await dbConnect();
    
    try {
        const {searchParams} = new URL(req.url);
        const queryParam = {
            username: searchParams.get("username")
        }
        //validate with zod
        const result =checkUsernameSchema.safeParse(queryParam);

        console.log(result) //ToDo remove

        if (!result.success) {
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(', ') : "Invalid query parameters"
            },{
                status: 400
            })
        }
        const { username } = result.data;
       const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });
        if (existingVerifiedUser) {
            return Response.json({
                success: false,
                message: "Username is already taken"
            }, {
                status: 409
            });
        }
         return Response.json({
                success: true,
                message: "Username is unique."
            }, {
                status: 200
            });
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