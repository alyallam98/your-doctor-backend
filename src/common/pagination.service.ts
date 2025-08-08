// // ===============================
// // TYPES AND INTERFACES
// // ===============================
// export enum SortOrder {
//   ASC = 1,
//   DESC = -1,
// }

// export interface BasePaginationArgs {
//   pageLimit?: number;
//   sortBy?: string;
//   sortOrder?: SortOrder;
// }

// export interface CursorPaginationArgs extends BasePaginationArgs {
//   cursor?: string;
// }

// export interface OffsetPaginationArgs extends BasePaginationArgs {
//   currentPage?: number;
//   offset?: number;
// }

// export interface PageInfo {
//   hasNextPage: boolean;
//   hasPreviousPage: boolean;
//   startCursor?: string;
//   endCursor?: string;
//   totalCount?: number;
// }

// export interface CursorPaginatedResponse<T> {
//   edges: Array<{
//     node: T;
//     cursor: string;
//   }>;
//   pageInfo: PageInfo;
// }

// export interface OffsetPaginatedResponse<T> {
//   data: T[];
//   pagination: {
//     currentPage: number;
//     pageLimit: number;
//     totalPages: number;
//     totalCount: number;
//     hasNextPage: boolean;
//     hasPreviousPage: boolean;
//   };
// }

// export interface PaginationConfig {
//   defaultPageLimit: number;
//   maxPageLimit: number;
//   defaultSortBy: string;
//   defaultSortOrder: SortOrder;
// }

// // ===============================
// // GRAPHQL INPUT TYPES
// // ===============================

// import {
//   ObjectType,
//   Field,
//   Int,
//   InputType,
//   registerEnumType,
// } from '@nestjs/graphql';

// registerEnumType(SortOrder, {
//   name: 'SortOrder',
//   description: 'Sort order for pagination',
// });

// @InputType()
// export class CursorPaginationInput implements CursorPaginationArgs {
//   @Field({ nullable: true, description: 'Cursor for pagination' })
//   cursor?: string;

//   @Field(() => Int, {
//     nullable: true,
//     defaultValue: 20,
//     description: 'Number of items per page',
//   })
//   pageLimit?: number;

//   @Field({ nullable: true, description: 'Field to sort by' })
//   sortBy?: string;

//   @Field(() => SortOrder, {
//     nullable: true,
//     defaultValue: SortOrder.ASC,
//     description: 'Sort order',
//   })
//   sortOrder?: SortOrder;
// }

// @InputType()
// export class OffsetPaginationInput implements OffsetPaginationArgs {
//   @Field(() => Int, {
//     nullable: true,
//     defaultValue: 1,
//     description: 'Current page number',
//   })
//   currentPage?: number;

//   @Field(() => Int, { nullable: true, description: 'Offset for pagination' })
//   offset?: number;

//   @Field(() => Int, {
//     nullable: true,
//     defaultValue: 20,
//     description: 'Number of items per page',
//   })
//   pageLimit?: number;

//   @Field({ nullable: true, description: 'Field to sort by' })
//   sortBy?: string;

//   @Field(() => SortOrder, {
//     nullable: true,
//     defaultValue: SortOrder.ASC,
//     description: 'Sort order',
//   })
//   sortOrder?: SortOrder;
// }

// // ===============================
// // GRAPHQL OUTPUT TYPES
// // ===============================

// @ObjectType()
// export class PageInfo {
//   @Field({ description: 'Whether there is a next page' })
//   hasNextPage: boolean;

//   @Field({ description: 'Whether there is a previous page' })
//   hasPreviousPage: boolean;

//   @Field({ nullable: true, description: 'Cursor of the first edge' })
//   startCursor?: string;

//   @Field({ nullable: true, description: 'Cursor of the last edge' })
//   endCursor?: string;

//   @Field(() => Int, { nullable: true, description: 'Total count of items' })
//   totalCount?: number;
// }

// @ObjectType()
// export class PaginationMeta {
//   @Field(() => Int, { description: 'Current page number' })
//   currentPage: number;

//   @Field(() => Int, { description: 'Number of items per page' })
//   pageLimit: number;

//   @Field(() => Int, { description: 'Total number of pages' })
//   totalPages: number;

//   @Field(() => Int, { description: 'Total count of items' })
//   totalCount: number;

//   @Field({ description: 'Whether there is a next page' })
//   hasNextPage: boolean;

//   @Field({ description: 'Whether there is a previous page' })
//   hasPreviousPage: boolean;
// }

// // ===============================
// // GENERIC HELPERS FOR CREATING TYPES
// // ===============================

// export function createEdgeType<T>(NodeType: new () => T) {
//   @ObjectType(`${NodeType.name}Edge`)
//   class Edge {
//     @Field(() => NodeType)
//     node: T;

//     @Field()
//     cursor: string;
//   }
//   return Edge;
// }

// export function createConnectionType<T>(NodeType: new () => T) {
//   const EdgeType = createEdgeType(NodeType);

//   @ObjectType(`${NodeType.name}Connection`)
//   class Connection {
//     @Field(() => [EdgeType])
//     edges: (typeof EdgeType)[];

//     @Field(() => PageInfo)
//     pageInfo: PageInfo;
//   }
//   return Connection;
// }

// export function createListType<T>(NodeType: new () => T) {
//   @ObjectType(`${NodeType.name}List`)
//   class List {
//     @Field(() => [NodeType])
//     data: T[];

//     @Field(() => PaginationMeta)
//     pagination: PaginationMeta;
//   }
//   return List;
// }

// // ===============================
// // BASE PAGINATION SERVICE
// // ===============================

// import { Injectable, BadRequestException } from '@nestjs/common';
// import { Model, Document, FilterQuery, PopulateOptions } from 'mongoose';

// export interface PaginationOptions {
//   selectFields?: string;
//   populateFields?: PopulateOptions | PopulateOptions[];
//   includeTotalCount?: boolean;
//   customConfig?: Partial<PaginationConfig>;
// }

// @Injectable()
// export class BasePaginationService<T extends Document> {
//   protected defaultConfig: PaginationConfig = {
//     defaultPageLimit: 20,
//     maxPageLimit: 100,
//     defaultSortBy: 'createdAt',
//     defaultSortOrder: SortOrder.ASC,
//   };

//   constructor(
//     protected model: Model<T>,
//     customConfig?: Partial<PaginationConfig>,
//   ) {
//     if (customConfig) {
//       this.defaultConfig = { ...this.defaultConfig, ...customConfig };
//     }
//   }

//   protected validateAndNormalizeArgs<TArgs extends BasePaginationArgs>(
//     args: TArgs,
//     customConfig?: Partial<PaginationConfig>,
//   ): TArgs {
//     const config = customConfig
//       ? { ...this.defaultConfig, ...customConfig }
//       : this.defaultConfig;

//     const pageLimit = Math.min(
//       args.pageLimit || config.defaultPageLimit,
//       config.maxPageLimit,
//     );

//     if (pageLimit <= 0) {
//       throw new BadRequestException('Page limit must be greater than 0');
//     }

//     return {
//       ...args,
//       pageLimit,
//       sortBy: args.sortBy || config.defaultSortBy,
//       sortOrder: args.sortOrder || config.defaultSortOrder,
//     };
//   }

//   protected buildSortQuery(
//     sortBy: string,
//     sortOrder: SortOrder,
//   ): { [key: string]: SortOrder } {
//     return { [sortBy]: sortOrder };
//   }

//   protected generateCursor(document: any, sortBy: string): string {
//     const value = document[sortBy];
//     if (value === undefined || value === null) {
//       throw new Error(`Sort field '${sortBy}' not found in document`);
//     }
//     return Buffer.from(JSON.stringify({ [sortBy]: value })).toString('base64');
//   }

//   protected decodeCursor(cursor: string): Record<string, any> {
//     try {
//       const decoded = JSON.parse(Buffer.from(cursor, 'base64').toString());
//       if (!decoded || typeof decoded !== 'object') {
//         throw new Error('Invalid cursor format');
//       }
//       return decoded;
//     } catch (error) {
//       throw new BadRequestException('Invalid cursor format');
//     }
//   }

//   protected buildCursorQuery(
//     baseQuery: FilterQuery<T>,
//     cursor: string,
//     sortBy: string,
//     sortOrder: SortOrder,
//   ): FilterQuery<T> {
//     const decodedCursor = this.decodeCursor(cursor);
//     const cursorValue = decodedCursor[sortBy];

//     if (cursorValue === undefined || cursorValue === null) {
//       throw new BadRequestException(
//         `Invalid cursor: missing sort field '${sortBy}'`,
//       );
//     }

//     const operator = sortOrder === SortOrder.ASC ? '$gt' : '$lt';

//     return {
//       ...baseQuery,
//       [sortBy]: { [operator]: cursorValue },
//     };
//   }

//   protected async executeQuery(
//     query: FilterQuery<T>,
//     options: {
//       sortQuery: { [key: string]: SortOrder };
//       skip?: number;
//       limit: number;
//       selectFields?: string;
//       populateFields?: PopulateOptions | PopulateOptions[];
//     },
//   ): Promise<T[]> {
//     let mongoQuery = this.model.find(query);

//     if (options.selectFields) {
//       mongoQuery = mongoQuery.select(options.selectFields);
//     }

//     mongoQuery = mongoQuery.sort(options.sortQuery);

//     if (options.skip !== undefined) {
//       mongoQuery = mongoQuery.skip(options.skip);
//     }

//     mongoQuery = mongoQuery.limit(options.limit);

//     if (options.populateFields) {
//       if (Array.isArray(options.populateFields)) {
//         options.populateFields.forEach((populate) => {
//           mongoQuery = mongoQuery.populate(populate);
//         });
//       } else {
//         mongoQuery = mongoQuery.populate(options.populateFields);
//       }
//     }

//     return mongoQuery.lean() as Promise<T[]>;
//   }

//   // Cursor-based pagination
//   async findWithCursorPagination(
//     baseQuery: FilterQuery<T>,
//     args: CursorPaginationArgs,
//     options: PaginationOptions = {},
//   ): Promise<CursorPaginatedResponse<T>> {
//     const normalizedArgs = this.validateAndNormalizeArgs(
//       args,
//       options.customConfig,
//     );
//     const { cursor, pageLimit, sortBy, sortOrder } = normalizedArgs;

//     let query = baseQuery;
//     if (cursor) {
//       query = this.buildCursorQuery(baseQuery, cursor, sortBy!, sortOrder!);
//     }

//     const sortQuery = this.buildSortQuery(sortBy!, sortOrder!);

//     // Fetch one extra document to determine if there's a next page
//     const documentsPromise = this.executeQuery(query, {
//       sortQuery,
//       limit: pageLimit! + 1,
//       selectFields: options.selectFields,
//       populateFields: options.populateFields,
//     });

//     const totalCountPromise = options.includeTotalCount
//       ? this.model.countDocuments(baseQuery)
//       : Promise.resolve(undefined);

//     const [documents, totalCount] = await Promise.all([
//       documentsPromise,
//       totalCountPromise,
//     ]);

//     const hasNextPage = documents.length > pageLimit!;
//     const nodes = hasNextPage ? documents.slice(0, -1) : documents;

//     const edges = nodes.map((node) => ({
//       node: node as T,
//       cursor: this.generateCursor(node, sortBy!),
//     }));

//     const pageInfo: PageInfo = {
//       hasNextPage,
//       hasPreviousPage: !!cursor,
//       startCursor: edges.length > 0 ? edges[0].cursor : undefined,
//       endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
//       totalCount,
//     };

//     return { edges, pageInfo };
//   }

//   // Offset-based pagination
//   async findWithOffsetPagination(
//     baseQuery: FilterQuery<T>,
//     args: OffsetPaginationArgs,
//     options: PaginationOptions = {},
//   ): Promise<OffsetPaginatedResponse<T>> {
//     const normalizedArgs = this.validateAndNormalizeArgs(
//       args,
//       options.customConfig,
//     );
//     const { pageLimit, sortBy, sortOrder } = normalizedArgs;
//     let { currentPage, offset } = normalizedArgs;

//     // Calculate offset from currentPage if not provided
//     if (!offset && currentPage) {
//       offset = (currentPage - 1) * pageLimit!;
//     } else if (!currentPage && offset) {
//       currentPage = Math.floor(offset / pageLimit!) + 1;
//     } else {
//       currentPage = currentPage || 1;
//       offset = offset || 0;
//     }

//     if (offset < 0) {
//       throw new BadRequestException('Offset must be non-negative');
//     }

//     if (currentPage! < 1) {
//       throw new BadRequestException('Current page must be greater than 0');
//     }

//     const sortQuery = this.buildSortQuery(sortBy!, sortOrder!);

//     const [data, totalCount] = await Promise.all([
//       this.executeQuery(baseQuery, {
//         sortQuery,
//         skip: offset,
//         limit: pageLimit!,
//         selectFields: options.selectFields,
//         populateFields: options.populateFields,
//       }),
//       options.includeTotalCount !== false
//         ? this.model.countDocuments(baseQuery)
//         : Promise.resolve(0),
//     ]);

//     const totalPages = Math.ceil(totalCount / pageLimit!);

//     return {
//       data: data as T[],
//       pagination: {
//         currentPage: currentPage!,
//         pageLimit: pageLimit!,
//         totalPages,
//         totalCount,
//         hasNextPage: currentPage! < totalPages,
//         hasPreviousPage: currentPage! > 1,
//       },
//     };
//   }

//   // Helper method for search with pagination
//   async searchWithPagination<
//     TArgs extends CursorPaginationArgs | OffsetPaginationArgs,
//   >(
//     searchQuery: FilterQuery<T>,
//     args: TArgs,
//     options: PaginationOptions = {},
//   ): Promise<CursorPaginatedResponse<T> | OffsetPaginatedResponse<T>> {
//     if ('cursor' in args || (!('currentPage' in args) && !('offset' in args))) {
//       return this.findWithCursorPagination(
//         searchQuery,
//         args as CursorPaginationArgs,
//         options,
//       );
//     } else {
//       return this.findWithOffsetPagination(
//         searchQuery,
//         args as OffsetPaginationArgs,
//         options,
//       );
//     }
//   }

//   // Helper method to get total count
//   async getTotalCount(query: FilterQuery<T>): Promise<number> {
//     return this.model.countDocuments(query);
//   }

//   // Helper method to check if document exists
//   async exists(query: FilterQuery<T>): Promise<boolean> {
//     const count = await this.model.countDocuments(query).limit(1);
//     return count > 0;
//   }
// }

// // ===============================
// // FACTORY FUNCTION FOR EASY SETUP
// // ===============================

// export function createPaginationService<T extends Document>(
//   model: Model<T>,
//   config?: Partial<PaginationConfig>,
// ) {
//   return new BasePaginationService<T>(model, config);
// }

// // ===============================
// // DECORATOR FOR AUTOMATIC PAGINATION
// // ===============================

// import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// import { GqlExecutionContext } from '@nestjs/graphql';

// export const PaginationArgs = createParamDecorator(
//   (data: unknown, context: ExecutionContext) => {
//     const ctx = GqlExecutionContext.create(context);
//     const args = ctx.getArgs();
//     return args.pagination || {};
//   },
// );
