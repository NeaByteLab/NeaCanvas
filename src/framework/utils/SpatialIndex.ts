/**
 * Spatial indexing utilities for geometric queries.
 */

/**
 * Represents a spatial object with bounds.
 */
export interface SpatialObject {
  id: string
  x: number
  y: number
  width: number
  height: number
}

/**
 * Represents a rectangular boundary.
 */
export interface Bounds {
  x: number
  y: number
  width: number
  height: number
}

/**
 * QuadTree implementation for spatial object management.
 * Handles insertion, deletion, and query operations.
 */
export class QuadTree {
  private bounds: Bounds
  private objects: SpatialObject[] = []
  private nodes: QuadTree[] = []
  private maxObjects: number = 10
  private maxLevels: number = 5
  private level: number = 0

  /**
   * Creates a new QuadTree with specified bounds.
   * @param x - X coordinate of the bounds
   * @param y - Y coordinate of the bounds
   * @param width - Width of the bounds
   * @param height - Height of the bounds
   * @param level - Current level in the tree (for recursion)
   */
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    level: number = 0
  ) {
    this.bounds = { x, y, width, height }
    this.level = level
  }

  /**
   * Clears all objects and child nodes from the QuadTree.
   */
  clear(): void {
    this.objects = []
    for (const node of this.nodes) {
      node.clear()
    }
    this.nodes = []
  }

  /**
   * Splits the current node into four equal child nodes.
   */
  private split(): void {
    const { x, y } = this.bounds
    const subWidth = this.bounds.width / 2
    const subHeight = this.bounds.height / 2
    this.nodes[0] = new QuadTree(
      x + subWidth,
      y,
      subWidth,
      subHeight,
      this.level + 1
    )
    this.nodes[1] = new QuadTree(x, y, subWidth, subHeight, this.level + 1)
    this.nodes[2] = new QuadTree(
      x,
      y + subHeight,
      subWidth,
      subHeight,
      this.level + 1
    )
    this.nodes[3] = new QuadTree(
      x + subWidth,
      y + subHeight,
      subWidth,
      subHeight,
      this.level + 1
    )
  }

  /**
   * Determines which node an object belongs to based on its position.
   * @param obj - Object to check
   * @returns Node index (0-3) for top-right, top-left, bottom-left, bottom-right quadrants, or -1 if object spans multiple quadrants
   */
  private getIndex(obj: SpatialObject): number {
    let index = -1
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2
    const topQuadrant =
      obj.y < horizontalMidpoint && obj.y + obj.height < horizontalMidpoint
    const bottomQuadrant = obj.y > horizontalMidpoint
    if (obj.x < verticalMidpoint && obj.x + obj.width < verticalMidpoint) {
      if (topQuadrant) {
        index = 1
      } else if (bottomQuadrant) {
        index = 2
      }
    } else if (obj.x > verticalMidpoint) {
      if (topQuadrant) {
        index = 0
      } else if (bottomQuadrant) {
        index = 3
      }
    }
    return index
  }

  /**
   * Inserts an object into the QuadTree.
   * @param obj - Object to insert
   */
  insert(obj: SpatialObject): void {
    if (this.tryInsertIntoChildNode(obj)) {
      return
    }
    this.objects.push(obj)
    this.redistributeObjectsIfNeeded()
  }

  /**
   * Attempts to insert object into appropriate child node.
   * @param obj - Object to insert
   * @returns True if object was inserted into child node
   */
  private tryInsertIntoChildNode(obj: SpatialObject): boolean {
    if (this.nodes.length === 0) {
      return false
    }
    const index = this.getIndex(obj)
    if (index !== -1 && this.nodes[index]) {
      this.nodes[index].insert(obj)
      return true
    }
    return false
  }

  /**
   * Redistributes objects to child nodes when current node exceeds capacity.
   */
  private redistributeObjectsIfNeeded(): void {
    const shouldRedistribute =
      this.objects.length > this.maxObjects && this.level < this.maxLevels
    if (!shouldRedistribute) {
      return
    }
    if (this.nodes.length === 0) {
      this.split()
    }
    this.moveObjectsToChildNodes()
  }

  /**
   * Moves objects from current node to appropriate child nodes during redistribution.
   */
  private moveObjectsToChildNodes(): void {
    let i = 0
    while (i < this.objects.length) {
      const currentObj = this.objects[i]
      if (this.tryMoveObjectToChildNode(currentObj, i)) {
        continue
      }
      i++
    }
  }

  /**
   * Attempts to move a single object to appropriate child node during redistribution.
   * @param obj - Object to move
   * @param index - Current index of object in array
   * @returns True if object was moved to child node
   */
  private tryMoveObjectToChildNode(
    obj: SpatialObject | undefined,
    index: number
  ): boolean {
    if (!obj) {
      return false
    }
    const nodeIndex = this.getIndex(obj)
    if (nodeIndex === -1 || !this.nodes[nodeIndex]) {
      return false
    }
    const removedObj = this.objects.splice(index, 1)[0]
    if (removedObj) {
      this.nodes[nodeIndex].insert(removedObj)
      return true
    }
    return false
  }

  /**
   * Removes an object from the QuadTree.
   * @param obj - Object to remove
   * @returns True if object was found and removed
   */
  remove(obj: SpatialObject): boolean {
    const index = this.objects.findIndex(o => o.id === obj.id)
    if (index !== -1) {
      this.objects.splice(index, 1)
      return true
    }
    if (this.nodes.length > 0) {
      const nodeIndex = this.getIndex(obj)
      if (nodeIndex !== -1 && this.nodes[nodeIndex]) {
        return this.nodes[nodeIndex].remove(obj)
      } else {
        for (const node of this.nodes) {
          if (node && node.remove(obj)) {
            return true
          }
        }
      }
    }
    return false
  }

  /**
   * Queries the QuadTree for objects within a rectangular area.
   * @param x - X coordinate of query area
   * @param y - Y coordinate of query area
   * @param width - Width of query area
   * @param height - Height of query area
   * @returns Array of objects that intersect with the query area
   */
  query(x: number, y: number, width: number, height: number): SpatialObject[] {
    const result: SpatialObject[] = []
    const queryBounds = { x, y, width, height }
    if (!this.intersects(this.bounds, queryBounds)) {
      return result
    }
    for (const obj of this.objects) {
      if (this.intersects(obj, queryBounds)) {
        result.push(obj)
      }
    }
    if (this.nodes.length > 0) {
      for (const node of this.nodes) {
        result.push(...node.query(x, y, width, height))
      }
    }
    return result
  }

  /**
   * Queries the QuadTree for objects at a specific point.
   * @param x - X coordinate of the point
   * @param y - Y coordinate of the point
   * @returns Array of objects that contain the specified point within their bounds
   */
  queryPoint(x: number, y: number): SpatialObject[] {
    return this.query(x, y, 1, 1).filter(
      obj =>
        x >= obj.x &&
        x <= obj.x + obj.width &&
        y >= obj.y &&
        y <= obj.y + obj.height
    )
  }

  /**
   * Checks if two rectangular areas intersect by comparing their boundaries.
   * @param rect1 - First rectangle
   * @param rect2 - Second rectangle
   * @returns True if rectangles overlap or touch
   */
  private intersects(rect1: Bounds, rect2: Bounds): boolean {
    return !(
      rect1.x > rect2.x + rect2.width ||
      rect1.x + rect1.width < rect2.x ||
      rect1.y > rect2.y + rect2.height ||
      rect1.y + rect1.height < rect2.y
    )
  }

  /**
   * Gets the total number of objects in the QuadTree.
   * @returns Total object count
   */
  size(): number {
    let count = this.objects.length
    for (const node of this.nodes) {
      count += node.size()
    }
    return count
  }

  /**
   * Gets statistics for the QuadTree.
   * @returns Object containing tree metrics
   */
  getStats(): {
    totalObjects: number
    maxDepth: number
    nodeCount: number
    averageObjectsPerNode: number
  } {
    const stats = {
      totalObjects: 0,
      maxDepth: this.level,
      nodeCount: 1,
      averageObjectsPerNode: 0
    }
    stats.totalObjects += this.objects.length
    for (const node of this.nodes) {
      const childStats = node.getStats()
      stats.totalObjects += childStats.totalObjects
      stats.maxDepth = Math.max(stats.maxDepth, childStats.maxDepth)
      stats.nodeCount += childStats.nodeCount
    }
    stats.averageObjectsPerNode = stats.totalObjects / stats.nodeCount
    return stats
  }
}
