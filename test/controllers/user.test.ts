import request from 'supertest'

import User, { UserDocument } from '../../src/models/User'
import app from '../../src/app'
import * as dbHelper from '../db-helper'

const signInPayload = {
    email: 'test@gmail.com',
    password: 'abcd1234'
}

const signInPayloadWithUnmatchedPassword = {
    email: 'test@gmail.com',
    password: 'abcd12345'
}

const signInPayloadWithInvalidEmail = {
    email: 'test@',
    password: 'abcd12345'
}

const updatePasswordPayload = {
    oldPassword: "abcd1234",
    newPassword: "abcd12345"
}

const invalidUpdatePasswordPayload = {
    oldPassword: "abcd1230",
    newPassword: "abcd12345"
}

const forgetPasswordPayload = {
    email: 'test@gmail.com'
}

//unregistered email
const invalidForgetPasswordPayload = {
    email: 'test1@gmail.com'
}

async function signUp(override?: Partial<UserDocument>) {
    let user = {
        email: 'test@gmail.com',
        firstName: 'Dung',
        lastName: 'Vo',
        password: 'abcd1234',
    }
    if (override) {
        user = { ...user, ...override }
    }
    return await request(app)
        .post('/api/v1/user').send(user)
}

describe('user controller', () => {
    let token: string;

    beforeEach(async () => {
        await dbHelper.connect()
    })

    afterEach(async () => {
        await dbHelper.clearDatabase()
    })

    afterAll(async () => {
        await dbHelper.closeDatabase()
    })

    it('should sign up a new user', async () => {
        const res = await signUp()

        expect(res.status).toBe(200)
        expect(res.body.user).toHaveProperty('_id')
        expect(res.body.user.firstName).toBe('Dung')
    })

    it('should not create a new user with already registered email', async () => {
        const res1 = await signUp()
        const res2 = await signUp()

        expect(res2.status).toBe(400)
    })

    it('should sign in a registered user', async () => {
        const res1 = await signUp()
        const res2 = await request(app).post('/api/v1/user/signIn').send(signInPayload)

        expect(res2.status).toBe(200)
        expect(res2.body).toHaveProperty('token')
        expect(res2.body.message).toEqual('Sign in successful')
    })

    it('should not sign in a registered user with an unmatched password/invalid email', async () => {
        const res1 = await signUp()
        const res2 = await request(app).post('/api/v1/user/signIn').send(signInPayloadWithUnmatchedPassword)
        const res3 = await request(app).post('/api/v1/user/signIn').send(signInPayloadWithInvalidEmail)

        expect(res2.status).toBe(401)
        expect(res2.body.message).toEqual('Password does not match')
        expect(res3.status).toBe(400)
        expect(res3.body.message).toEqual('Must be a valid email address')
    })

    // it('should allow a valid Google sign in', async () => {  
    //     const res = await request(app).post('/api/v1/user/googleSignIn').set('Authorization', `Bearer ${process.env.GOOGLE_MOCK_ACCESS_TOKEN}`)
    //     expect(res.status).toBe(200)
    //     expect(res.body).toHaveProperty('token')
    //     expect(res.body.message).toEqual('Sign in successful')
    // })

    it('should update profile of an existing user', async () => {
        const res1 = await signUp()
        const res2 = await request(app).post('/api/v1/user/signIn').send(signInPayload)
        const update = {
            firstName: "John",
            lastName: "Doe"
        }

        const res3 = await request(app).put('/api/v1/user/updateProfile').set('Authorization', `Bearer ${res2.body.token}`).send(update)

        expect(res3.status).toBe(200)
        expect(res3.body.message).toEqual("Profile updated successfully")
    })

    it('should not update an already taken email', async () => {
        const res1 = await signUp()
        const res2 = await request(app).post('/api/v1/user/signIn').send(signInPayload)

        const res3 = await signUp({
            email: "john.doe@gmail.com",
            firstName: "John",
            lastName: "Doe",
            password: "abcd1234"
        })

        const update = {
            email: "john.doe@gmail.com"
        }

        const res4 = await request(app).put('/api/v1/user/updateProfile').set('Authorization', `Bearer ${res2.body.token}`).send(update)

        expect(res4.status).toBe(400)
    })

    it('should update a new password', async () => {
        const res1 = await signUp()
        const res2 = await request(app).post('/api/v1/user/signIn').send(signInPayload)
        const res3 = await request(app).put('/api/v1/user/updatePassword').set('Authorization', `Bearer ${res2.body.token}`).send(updatePasswordPayload)

        expect(res3.status).toBe(200)
        expect(res3.body.message).toEqual("Password updated successfully")
    })

    it('should not update a new password when old password is unmatched', async () => {
        const res1 = await signUp()
        const res2 = await request(app).post('/api/v1/user/signIn').send(signInPayload)
        const res3 = await request(app).put('/api/v1/user/updatePassword').set('Authorization', `Bearer ${res2.body.token}`).send(invalidUpdatePasswordPayload)

        expect(res3.status).toBe(400)
    })

    // it('should send a forget-password retrieval email', async () => {
    //     const res1 = await signUp()
    //     const res2 = await request(app).post('/api/v1/user/resetPassword').send(forgetPasswordPayload)

    //     expect(res2.status).toBe(200)
    //     expect(res2.body.message).toEqual('Email sent successful')
    // })

    it('should not send a forget-password retrieval email to an unregistered email', async () => {
        const res1 = await signUp()

        const res2 = await request(app).post('/api/v1/user/resetPassword').send(invalidForgetPasswordPayload)

        expect(res2.status).toBe(400)
    })

    // it('should reset password', async () => {
    //     const res1 = await signUp()
    //     const res2 = await request(app).post('/api/v1/user/resetPassword').send(forgetPasswordPayload)

    //     const resetPasswordPayload = {
    //         newPassword: 'password123'
    //     }

    //     const res3 = await request(app).put(`/api/v1/user/resetPassword/${res2.body.resetToken}`).send(resetPasswordPayload)

    //     expect(res3.status).toBe(200)
    //     expect(res3.body.message).toEqual('Reset password successful')
    // })

    // it('should not reset password', async () => {
    //     const res1 = await signUp()
    //     const res2 = await request(app).post('/api/v1/user/resetPassword').send(forgetPasswordPayload)

    //     const invalidResetPasswordPayload = {
    //         newPassword: 'password'
    //     }
    //     const res3 = await request(app).put(`/api/v1/user/resetPassword/${res2.body.resetToken}`).send(invalidResetPasswordPayload)

    //     expect(res3.status).toBe(400)
    // })
})
