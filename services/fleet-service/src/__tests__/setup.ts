import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";
import { PrismaClient } from "../generated/prisma/client";

// Create the mock
const prismaMock = mockDeep<PrismaClient>();

// Mock the prisma module
jest.mock("../db/prisma", () => ({
  __esModule: true,
  default: prismaMock,
}));

// Mock S3 upload
jest.mock("../utils/s3", () => ({
  uploadToS3: jest.fn().mockResolvedValue("https://s3.example.com/test-photo.jpg"),
}));

// Reset mocks before each test
beforeEach(() => {
  mockReset(prismaMock);
});

export { prismaMock };
export type MockPrismaClient = DeepMockProxy<PrismaClient>;
