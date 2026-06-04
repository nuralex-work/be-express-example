import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { HandleResponse, HandleResponseErrors } from "../../helper/response";
import { GetUserFromToken } from "../../helper/jwt";

const validateRolePayload = (body: any) => {
  const errors: string[] = [];

  if (typeof body.name !== "string" || body.name.trim() === "") {
    errors.push("Name is required");
  }

  return errors;
};

// READ All Users
export const getRoles = async (req: Request, res: Response) => {
  const { limit, page, name } = req.query;

  try {
    const [record, total_record] = await Promise.all([
      prisma.m_roles.findMany({
        select: {
          id: true,
          name: true,
          permission: true,
          created_at: true,
          created_by: true,
        },
        where: {
          deleted_at: null,
          name: name
            ? { contains: name as string, mode: "insensitive" }
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
      prisma.m_roles.count({
        where: {
          deleted_at: null,
          name: name
            ? { contains: name as string, mode: "insensitive" }
            : undefined,
        },
      }),
    ]);

    if (record.length === 0) {
      return HandleResponseErrors(res, 404, "Failed", ["No Roles available"]);
    }
    HandleResponse(res, 200, "Roles retrieved successfully", {
      record,
      total_record,
    });
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to retrieve Roles"]);
  }
};

// // READ Single User
export const getRolesById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const role = await prisma.m_roles.findFirst({
      where: {
        id: id.toLocaleString(),
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        permission: true,
        created_at: true,
        created_by: true,
      },
    });
    if (!role) {
      return HandleResponseErrors(res, 404, "Failed", ["Roles not found"]);
    }
    HandleResponse(res, 200, "Roles retrieved successfully", role);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to retrieve user"]);
  }
};

// CREATE User
export const createRoles = async (req: Request, res: Response) => {
  const createdby = GetUserFromToken(req);
  const { name, permission } = req.body;
  const errors = validateRolePayload(req.body);

  if (errors.length > 0) {
    return HandleResponseErrors(res, 400, "Validation Failed", errors);
  }

  const existingRole = await prisma.m_roles.findFirst({
    where: { name },
  });
  
  if (existingRole) {
    return HandleResponseErrors(res, 409, "Failed", ["Roles already exists"]);
  }

  try {
    const data = await prisma.m_roles.create({
      data: {
        name,
        permission: permission ? JSON.parse(JSON.stringify(permission)) : null,
        created_by: createdby,
        created_at: new Date(),
      },
    });

    if (!data) {
      return HandleResponseErrors(res, 400, "Failed", ["Roles creation failed"]);
    }
    HandleResponse(res, 201, "Roles created successfully", data);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Roles creation failed"]);
  }
};

// UPDATE User
export const updateRoles = async (req: Request, res: Response) => {
  const { name, permission } = req.body;
  const updatedby = GetUserFromToken(req);
  const { id } = req.params;
  const errors = validateRolePayload(req.body);

  if (errors.length > 0) {
    return HandleResponseErrors(res, 400, "Validation Failed", errors);
  }

  try {
    const existingRole = await prisma.m_roles.findFirst({
      where: {
        id: id.toLocaleString(),
        deleted_at: null,
      },
    });
    if (!existingRole) {
      return HandleResponseErrors(res, 404, "Failed", ["Roles not found"]);
    }

    const duplicateRole = await prisma.m_roles.findFirst({
      where: {
        name,
        NOT: {
          id: id.toLocaleString(),
        },
      },
    });
    if (duplicateRole) {
      return HandleResponseErrors(res, 409, "Failed", ["Roles already exists"]);
    }

    const data = await prisma.m_roles.update({
      where: { id: id.toLocaleString() },
      data: {
        name,
        permission: permission ? JSON.parse(JSON.stringify(permission)) : null,
        updated_at: new Date(),
        updated_by: updatedby,
      },
    });

    HandleResponse(res, 200, "Roles updated successfully", data);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to update Roles"]);
  }
};

// DELETE User
export const deleteRoles = async (req: Request, res: Response) => {
  const { id } = req.params;
  const createdby = GetUserFromToken(req);
  try {
    const data = await prisma.m_roles.update({
      where: { id: id.toLocaleString() },
      data: {
        deleted_at: new Date(),
        deleted_by: createdby,
        status: "Inactive",
      },
    });
    if (!data) {
      return HandleResponseErrors(res, 404, "Failed", ["Roles not found"]);
    }
    HandleResponse(res, 200, "Roles deleted successfully", data);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to delete Roles"]);
  }

  // try {
  //   await prisma.users.delete({ where: { id: id.toLocaleString() } });
  //   HandleResponse(res, 200, "User deleted successfully");
  // } catch (error) {
  //   HandleResponseErrors(res, 400, "Failed", ["Failed to delete user"]);
  // }
};
