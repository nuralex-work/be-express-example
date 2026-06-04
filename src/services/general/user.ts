import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../../db/prisma";
import { HandleResponse, HandleResponseErrors } from "../../helper/response";
import { GetUserFromToken } from "../../helper/jwt";

const isEmpty = (value: unknown) =>
  typeof value !== "string" || value.trim() === "";

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const validateUserPayload = (body: any, requirePassword: boolean) => {
  const errors: string[] = [];

  if (isEmpty(body.fullname)) errors.push("Name is required");
  if (isEmpty(body.email)) {
    errors.push("Email is required");
  } else if (!isValidEmail(body.email)) {
    errors.push("Invalid email format");
  }
  if (requirePassword && isEmpty(body.password)) {
    errors.push("Password is required");
  }
  if (isEmpty(body.username)) errors.push("Username is required");
  if (isEmpty(body.roleid)) errors.push("Role is required");

  return errors;
};

// READ All Users
export const getUsers = async (req: Request, res: Response) => {
  const { limit, page, fullname } = req.query;

  try {
    const [record, total_record] = await Promise.all([
      prisma.m_user.findMany({
        select: {
          id: true,
          email: true,
          fullname: true,
          username: true,
          roleid: true,
          roles: {
            select: {
              name: true,
            },
          },
          created_at: true,
          created_by: true,
          last_login:true,
        },
        where: {
          deleted_at: null,
          fullname: fullname
            ? { contains: fullname as string, mode: "insensitive" }
            : undefined,
        },
        orderBy: {
          created_at: "desc",
        },
        take: limit ? parseInt(limit as string) : 10,
        skip: page
          ? (parseInt(page as string) - 1) *
            (limit ? parseInt(limit as string) : 10)
          : 0,
      }),
      prisma.m_user.count({
        where: {
          deleted_at: null,
          fullname: fullname
            ? { contains: fullname as string, mode: "insensitive" }
            : undefined,
        },
      }),
    ]);
    if (record.length === 0) {
      return HandleResponseErrors(res, 404, "Failed", ["No users available"]);
    }
    HandleResponse(res, 200, "Users retrieved successfully", {
      record,
      total_record,
    });
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to retrieve users"]);
  }
};

// // READ Single User
export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.m_user.findUnique({
      where: { id: id.toLocaleString() },
      select: {
        id: true,
        email: true,
        fullname: true,
        username: true,
        roleid: true,
        roles: {
          select: {
            name: true,
          },
        },
        created_at: true,
        created_by: true,
        last_login:true,
      },
    });
    if (!user) {
      return HandleResponseErrors(res, 404, "Failed", ["User not found"]);
    }
    HandleResponse(res, 200, "User retrieved successfully", user);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to retrieve user"]);
  }
};

// CREATE User
export const createUser = async (req: Request, res: Response) => {
  const createdby = GetUserFromToken(req);
  const { email, password, username, fullname, roleid } = req.body;
  const errors = validateUserPayload(req.body, true);

  if (errors.length > 0) {
    return HandleResponseErrors(res, 400, "Validation Failed", errors);
  }

  const existingUser = await prisma.m_user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });
  if (existingUser) {
    return HandleResponseErrors(res, 409, "Failed", ["User already exists"]);
  }

  const role = await prisma.m_roles.findFirst({
    where: {
      id: roleid,
      deleted_at: null,
    },
  });
  if (!role) {
    return HandleResponseErrors(res, 404, "Failed", ["Role not found"]);
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.m_user.create({
      data: {
        email,
        password: hashedPassword,
        fullname: fullname,
        username,
        roleid: roleid,
        created_by: createdby,
        created_at: new Date(),
      },
    });
    if (!user) {
      return HandleResponseErrors(res, 400, "Failed", ["User creation failed"]);
    }
    HandleResponse(res, 201, "User created successfully", user);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["User creation failed"]);
  }
};

// UPDATE User
export const updateUser = async (req: Request, res: Response) => {
  const createdby = GetUserFromToken(req);
  const { id } = req.params;
  const { email, password, username, fullname, roleid } = req.body;
  const errors = validateUserPayload(req.body, false);

  if (errors.length > 0) {
    return HandleResponseErrors(res, 400, "Validation Failed", errors);
  }

  try {
    const existingUser = await prisma.m_user.findFirst({
      where: {
        id: id.toLocaleString(),
        deleted_at: null,
      },
    });
    if (!existingUser) {
      return HandleResponseErrors(res, 404, "Failed", ["User not found"]);
    }

    const duplicateUser = await prisma.m_user.findFirst({
      where: {
        OR: [{ email }, { username }],
        NOT: {
          id: id.toLocaleString(),
        },
      },
    });
    if (duplicateUser) {
      return HandleResponseErrors(res, 409, "Failed", ["User already exists"]);
    }

    const role = await prisma.m_roles.findFirst({
      where: {
        id: roleid,
        deleted_at: null,
      },
    });
    if (!role) {
      return HandleResponseErrors(res, 404, "Failed", ["Role not found"]);
    }

    let user;
    if (password != undefined && password != "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = await prisma.m_user.update({
        where: { id: id.toLocaleString() },
        data: {
          email,
          password: hashedPassword,
          username,
          fullname,
          roleid,
          updated_at: new Date(),
          updated_by: createdby,
        },
      });
    } else {
      user = await prisma.m_user.update({
        where: { id: id.toLocaleString() },
        data: {
          email,
          username,
          fullname,
          roleid,
          updated_at: new Date(),
          updated_by: createdby,
        },
      });
    }

    if (!user) {
      return HandleResponseErrors(res, 404, "Failed", ["User not found"]);
    }

    HandleResponse(res, 200, "User updated successfully", user);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to update user"]);
  }
};

// DELETE User
export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const createdby = GetUserFromToken(req);
  try {
    const datauser = await prisma.m_user.update({
      where: { id: id.toLocaleString() },
      data: {
        deleted_at: new Date(),
        deleted_by: createdby,
        status: "Inactive",
      },
    });
    if (!datauser) {
      return HandleResponseErrors(res, 404, "Failed", ["User not found"]);
    }
    HandleResponse(res, 200, "User deleted successfully", datauser);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to delete user"]);
  }

  // try {
  //   await prisma.m_user.delete({ where: { id: id.toLocaleString() } });
  //   HandleResponse(res, 200, "User deleted successfully");
  // } catch (error) {
  //   HandleResponseErrors(res, 400, "Failed", ["Failed to delete user"]);
  // }
};
