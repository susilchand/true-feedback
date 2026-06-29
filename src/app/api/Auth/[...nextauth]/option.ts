import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials"; // Fixed typo
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({ 
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    // Fixed: use credentials.email instead of credentials.identifier
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials?.email },
                            { username: credentials?.email } // Using email for username search too
                        ]
                    });
                    
                    if (!user) {
                        throw new Error("User not found");
                    }
                    
                    if (!user.isVerified) {
                        throw new Error("User is not verified");
                    }
                    
                    const isPasswordCorrect = await bcrypt.compare(
                        credentials?.password || "", 
                        user.password
                    );
                    
                    if (isPasswordCorrect) {
                        return {
                            id: user._id.toString(),
                            _id: user._id.toString(),
                            email: user.email,
                            username: user.username,
                            isVerified: user.isVerified,
                            isAcceptingMessage: user.isAcceptingMessage,
                        };
                    } else {
                        throw new Error("Invalid password");
                    }
                } catch (err: any) {
                    throw new Error(err.message || "Authentication failed");
                }
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id as string;
                session.user.isVerified = token.isVerified as boolean;
                session.user.isAcceptingMessage = token.isAcceptingMessage as boolean;
                session.user.username = token.username as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessage = user.isAcceptingMessage;
                token.username = user.username;
            }
            return token;
        }
    },
    pages: {
        signIn: "/sign-in",
    },
    session: {
        strategy: "jwt",
    },
    secret: process.env.NEXTAUTH_SECRET,
};