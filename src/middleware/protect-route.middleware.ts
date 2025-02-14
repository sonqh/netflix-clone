import jwt, { JwtPayload } from 'jsonwebtoken'
import { Request, Response, NextFunction } from 'express'
import { User } from '~/models/user.model'
import InternalServerError from '~/errors/internal-server-error'
import NotFoundError from '~/errors/not-found'
import UnauthorizedError from '~/errors/unauthorized-error'
import logger from '../logger'

interface DecodedToken extends JwtPayload {
  userId: string
}

/**
 * Middleware to protect routes by verifying JWT tokens.
 *
 * @param {Request} req - The incoming request object.
 * @param {Response} res - The outgoing response object.
 * @param {NextFunction} next - The next middleware function.
 * @returns {Promise<void>} - A promise that resolves to void.
 * @throws {UnauthorizedError} - If no token is provided or the token is invalid.
 * @throws {InternalServerError} - If the JWT_SECRET is not defined.
 * @throws {NotFoundError} - If the user is not found.
 */
export const protectRoute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies['jwt-netflix']

    if (!token) {
      throw new UnauthorizedError('Unauthorized - No Token Provided')
    }

    if (!process.env.JWT_SECRET) {
      throw new InternalServerError('JWT_SECRET is not defined')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken

    if (!decoded || !decoded.userId) {
      throw new UnauthorizedError('Unauthorized - Invalid Token')
    }

    const user = await User.findById(decoded.userId).select('-password')

    if (!user) {
      throw new NotFoundError('User not found')
    }

    req.user = user
    next()
  } catch (error) {
    logger.error('Error in protectRoute middleware:', {
      message: (error as Error).message,
      stack: (error as Error).stack
    })
    next(error)
  }
}
