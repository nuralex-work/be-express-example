import { HandleResponse, HandleResponseErrors } from "../../helper/response";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../db/prisma";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (typeof email !== "string" || email.trim() === "") {
      return HandleResponseErrors(res, 400, "Validation Failed", ["Email is required"], null);
    }
    if (typeof password !== "string" || password.trim() === "") {
      return HandleResponseErrors(res, 400, "Validation Failed", ["Password is required"], null);
    }

    const user = await prisma.m_user.findUnique({ 
      where: { email },
      select: { id: true, email: true, password: true, roleid: true, roles: true },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return HandleResponseErrors(
            res,
            400,
            "Failed",    
            ["Email or password is incorrect"],
            null,
          );
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "6h",
    });

    if (!token) {
      return HandleResponseErrors(
        res,
        400,
        "Failed",
        ["Failed to generate token"],
        null,
      );
    }

    await prisma.m_user.update({
      where: { id: user.id },
      data: {
        last_login: new Date(),
      },
    })

    const tokenData = {
      access_token: token,
      token_type: "Bearer",
      expires_in: new Date(Date.now() + 21600000).toString(), // 6 hours in milliseconds
      created_at: new Date().toString(),
      duration: "6h",
      roles: user.roles.name == undefined ? "" : user.roles.name,
    };
    
    HandleResponse(res, 200, "Login successful", tokenData);
  } catch (error) {
    HandleResponseErrors(
      res,
      400,
      "Failed",
      ["Email or password is incorrect"],
      null,
    );
  }
};
