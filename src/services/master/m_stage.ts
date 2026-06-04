import { Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { GetUserFromToken } from "../../helper/jwt";
import { HandleResponse, HandleResponseErrors } from "../../helper/response";

const validateStagePayload = (body: any) => {
  const errors: string[] = [];

  if (typeof body.name !== "string" || body.name.trim() === "") {
    errors.push("Name is required");
  }

  return errors;
};

export const getStages = async (req: Request, res: Response) => {
  const { limit, page, name } = req.query;

  try {
    const take = limit ? parseInt(limit as string) : 10;
    const skip = page ? (parseInt(page as string) - 1) * take : 0;

    const [record, total_record] = await Promise.all([
      prisma.m_stage.findMany({
        select: {
          id: true,
          name: true,
          created_at: true,
          created_by: true,
          updated_at: true,
          updated_by: true,
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
        take,
        skip,
      }),
      prisma.m_stage.count({
        where: {
          deleted_at: null,
          name: name
            ? { contains: name as string, mode: "insensitive" }
            : undefined,
        },
      }),
    ]);

    if (record.length === 0) {
      return HandleResponseErrors(res, 404, "Failed", ["No stages available"]);
    }

    HandleResponse(res, 200, "Stages retrieved successfully", {
      record,
      total_record,
    });
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to retrieve stages"]);
  }
};

export const getStageById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const data = await prisma.m_stage.findFirst({
      where: {
        id: id.toLocaleString(),
        deleted_at: null,
      },
      select: {
        id: true,
        name: true,
        created_at: true,
        created_by: true,
        updated_at: true,
        updated_by: true,
      },
    });

    if (!data) {
      return HandleResponseErrors(res, 404, "Failed", ["Stage not found"]);
    }

    HandleResponse(res, 200, "Stage retrieved successfully", data);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to retrieve stage"]);
  }
};

export const createStage = async (req: Request, res: Response) => {
  const createdby = GetUserFromToken(req);
  const { name } = req.body;
  const errors = validateStagePayload(req.body);

  if (errors.length > 0) {
    return HandleResponseErrors(res, 400, "Validation Failed", errors);
  }

  const existing = await prisma.m_stage.findFirst({
    where: {
      name,
    },
  });

  if (existing) {
    return HandleResponseErrors(res, 409, "Failed", ["Stage already exists"]);
  }

  try {
    const data = await prisma.m_stage.create({
      data: {
        name,
        created_by: createdby,
        created_at: new Date(),
      },
    });

    HandleResponse(res, 201, "Stage created successfully", data);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Stage creation failed"]);
  }
};

export const updateStage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;
  const updatedby = GetUserFromToken(req);
  const errors = validateStagePayload(req.body);

  if (errors.length > 0) {
    return HandleResponseErrors(res, 400, "Validation Failed", errors);
  }

  try {
    const existing = await prisma.m_stage.findFirst({
      where: {
        id: id.toLocaleString(),
        deleted_at: null,
      },
    });
    if (!existing) {
      return HandleResponseErrors(res, 404, "Failed", ["Stage not found"]);
    }

    const duplicate = await prisma.m_stage.findFirst({
      where: {
        name,
        NOT: {
          id: id.toLocaleString(),
        },
      },
    });

    if (duplicate) {
      return HandleResponseErrors(res, 409, "Failed", ["Stage already exists"]);
    }

    const data = await prisma.m_stage.update({
      where: { id: id.toLocaleString() },
      data: {
        name,
        updated_at: new Date(),
        updated_by: updatedby,
      },
    });

    HandleResponse(res, 200, "Stage updated successfully", data);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to update stage"]);
  }
};

export const deleteStage = async (req: Request, res: Response) => {
  const { id } = req.params;
  const deletedby = GetUserFromToken(req);

  try {
    const data = await prisma.m_stage.update({
      where: { id: id.toLocaleString() },
      data: {
        deleted_at: new Date(),
        deleted_by: deletedby,
      },
    });

    HandleResponse(res, 200, "Stage deleted successfully", data);
  } catch (error) {
    HandleResponseErrors(res, 400, "Failed", ["Failed to delete stage"]);
  }
};
