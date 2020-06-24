import jwt from 'jsonwebtoken'

import User from '../../src/models/User'
import UserService from '../../src/services/user'
import * as dbHelper from '../db-helper'

const unregisteredEmail = "unregistered@gmail.com"
const unmatchedPassword = "password123"

async function signUp() {
    const user = new User({
        email: 'test@gmail.com',
        firstName: 'Dung',
        lastName: 'Vo',
        password: 'abcd1234',
    })
    return await UserService.signUp(user)
}

describe('user service', () => {
    beforeEach(async () => {
        await dbHelper.connect()
    })

    afterEach(async (done) => {
        await dbHelper.clearDatabase()
        done()
    })

    afterAll(async (done) => {
        await dbHelper.closeDatabase()
        done()
    })

    it('should sign up new user', async () => {
        const user = await signUp()

        expect(user).toHaveProperty('_id')
        expect(user).toHaveProperty('firstName', 'Dung')
        expect(user).toHaveProperty('email', 'test@gmail.com')
    })

    it('should not sign up new user with an already registered email', async () => {
        expect.assertions(1)
        const user1 = await signUp()

        return await UserService.signUp(new User({
            //email belong to user1
            email: 'test@gmail.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234',
        })).catch(e => {
            expect(e.message).toEqual('Email has already registered')
        })
    })

    it('should not sign up new user with an invalid email', async () => {
        function invalidEmail() {
            UserService.signUp(new User({
                email: 'test@',
                firstName: 'John',
                lastName: 'Doe',
                password: 'abcd1234',
            }))
        }

        expect(invalidEmail).toThrowError('Must be a valid email address')
    })

    it('should not sign up new user with an invalid password', async () => {
        function invalidPassword() {
            UserService.signUp(new User({
                email: 'test@email.com',
                firstName: 'John',
                lastName: 'Doe',
                password: 'abcd',
            }))
        }

        expect(invalidPassword).toThrowError('Password must be from eight characters, at least one letter and one number')
    })

    it('should sign in a registered user', async () => {
        const user = await signUp()

        const token = await UserService.signIn({
            email: user.email,
            password: 'abcd1234'
        })
        const decode = jwt.decode(token)

        expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        expect(decode).toHaveProperty('email', user.email)
    })

    it('should not sign in with unregistered email', async () => {
        expect.assertions(1)
        const user = await signUp()

        return await UserService.signIn({
            email: unregisteredEmail,
            password: 'abcd1234'
        }).catch(e => {
            expect(e.message).toEqual('Email has not been registered')
        })
    })

    it('should not sign in with unmatched password', async () => {
        expect.assertions(1)
        const user = await signUp()

        return await UserService.signIn({
            email: user.email,
            password: unmatchedPassword
        }).catch(e => {
            expect(e.message).toEqual('Password does not match')
        })
    })

    it('should not sign in with invalid email syntax', async () => {
        function badRequest() {
            UserService.signIn({
                email: 'email@',
                password: 'abcd1234'
            })
        }

        expect(badRequest).toThrowError('Must be a valid email address')
    })

    it('should not sign in with invalid email syntax', async () => {
        function badRequest() {
            UserService.signIn({
                email: 'email@email.com',
                password: 'abcd'
            })
        }

        expect(badRequest).toThrowError('Password must be from eight characters, at least one letter and one number')
    })

    it('should sign in a user with Google account', async () => {
        const token = await UserService.googleSignIn({
            email: 'dungvo0111@gmail.com',
            firstName: 'Dung',
            lastName: 'Vo'
        })
        const decode = jwt.decode(token)

        expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        expect(decode).toHaveProperty('email', 'dungvo0111@gmail.com')
    })

    it('should update profile of a registered user', async () => {
        const user = await signUp()

        const token = await UserService.updateProfile({
            firstName: "Dung",
            lastName: "Vo",
            authData: {
                email: user.email,
                userId: user._id.toString()
            }
        })
        const decode = jwt.decode(token)

        expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        expect(decode).toHaveProperty('firstName', 'Dung')
        expect(decode).toHaveProperty('lastName', 'Vo')
    })

    it('should not update profile with invalid email', async () => {
        expect.assertions(1)
        const user = await signUp()

        return await UserService.updateProfile({
            email: 'email@',
            authData: {
                email: user.email,
                userId: user._id.toString()
            }
        }).catch(e => {
            expect(e.message).toEqual('Must be a valid email address')
        })
    })

    it('should not update profile with taken email', async () => {
        expect.assertions(1)
        const user1 = await signUp()
        const user2 = await UserService.signUp(new User({
            email: 'user2@email.com',
            firstName: 'John',
            lastName: 'Doe',
            password: 'abcd1234',
        }))

        return await UserService.updateProfile({
            //user2 accidentally change his email to user1's email
            email: user1.email,
            authData: {
                email: user2.email,
                userId: user2._id.toString()
            }
        }).catch(e => {
            expect(e.message).toEqual('This email is already taken')
        })

    })

    it('should change password of a registered user', async () => {
        const user = await signUp()

        const token = await UserService.changePassword({
            oldPassword: "abcd1234",
            newPassword: "abcd12345",
            authData: {
                email: user.email,
                userId: user._id.toString()
            }
        })
        const decode = jwt.decode(token)

        expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        expect(decode).toHaveProperty('email', user.email)
    })

    it('should not change to an invalid password', async () => {
        expect.assertions(1)
        const user = await signUp()

        return await UserService.changePassword({
            oldPassword: "abcd1234",
            newPassword: "abcd",
            authData: {
                email: user.email,
                userId: user._id.toString()
            }
        }).catch(e => {
            expect(e.message).toEqual('Password must be from eight characters, at least one letter and one number')
        })
    })

    it('should not update to a new password with a given unmatched old password', async () => {
        expect.assertions(1)
        const user = await signUp()

        return await UserService.changePassword({
            oldPassword: unmatchedPassword,
            newPassword: "abcd1234",
            authData: {
                email: user.email,
                userId: user._id.toString()
            }
        }).catch(e => {
            expect(e.message).toEqual('Old password does not match')
        })
    })

    it('should request password retrieval email', async () => {
        const user = await signUp()

        const token = await UserService.resetPasswordRequest({
            email: user.email,
            url: 'frontendURL'
        })
        const decode = jwt.decode(token)

        expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        expect(decode).toHaveProperty('email', user.email)
        expect(decode).toHaveProperty('userId', user._id.toString())
    })

    it('should not request password retrieval email to an invalid email', async () => {
        expect.assertions(1)
        const user = await signUp()

        return await UserService.resetPasswordRequest({
            email: "invalidEmail@",
            url: 'frontendURL'
        }).catch(e => {
            expect(e.message).toEqual('Must be a valid email address')
        })
    })

    it('should not request password retrieval email to an unregistered email', async () => {
        expect.assertions(1)
        const user = await signUp()

        return await UserService.resetPasswordRequest({
            email: unregisteredEmail,
            url: 'frontendURL'
        }).catch(e => {
            expect(e.message).toEqual('Email has not been registered')
        })
    })

    it('should reset password', async () => {
        const user = await signUp()

        const token = await UserService.resetPasswordRequest({
            email: user.email,
            url: 'frontendURL'
        })
        const decode = jwt.decode(token)

        const reset = await UserService.resetPassword({
            newPassword: 'newpassword123',
            resetToken: {
                email: user.email,
                userId: user._id.toString()
            }
        })

        expect(token).toMatch(/^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/)
        //check if the decoded info inside token matches the reset user
        expect(decode).toHaveProperty('email', reset.email)
        expect(decode).toHaveProperty('userId', reset._id.toString())
        expect(reset).toHaveProperty('email', user.email)
    })

    it('should not reset password to an invalid-formatted password', async () => {
        expect.assertions(1)
        const user = await signUp()

        return await UserService.resetPassword({
            newPassword: 'invalidpassword',
            resetToken: {
                email: user.email,
                userId: user._id.toString()
            }
        }).catch(e => {
            expect(e.message).toEqual('Password must be from eight characters, at least one letter and one number')
        })
    })


})
