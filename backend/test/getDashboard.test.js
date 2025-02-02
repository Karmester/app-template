const app = require('../app')
const mockserver = require('supertest');
const mongoose = require('mongoose');
const {MongoMemoryServer} = require('mongodb-memory-server');
const User = require('../model/user');

it('should return an empty array dashboards for a new user.', async () => {
    //given
    const virtualMongoDb = await MongoMemoryServer.create();
    const uri = virtualMongoDb.getUri();
    const connectionVirtualMongoDb = await mongoose.connect(uri);

    const newUser = new User({
        username: "testUser", googleId: "testGoogle"
    });
    await newUser.save();

    const client = mockserver.agent(app);
    client.set('authorization', newUser._id);

    //when
    const response = await client.get('/api/dashboards')

    //then
    expect(response.body.user.dashboards).toStrictEqual([]);

    await connectionVirtualMongoDb.disconnect();
    await virtualMongoDb.stop();
});

it('should return a dashboard with matching _id for a user if it exists.', async () => {
    //given
    const virtualMongoDb = await MongoMemoryServer.create();
    const uri = virtualMongoDb.getUri();
    const connectionVirtualMongoDb = await mongoose.connect(uri);

    const newUser = new User({
        username: "testUser",
        googleId: "testGoogle",
        dashboards: [
            {
                title: "testDashboard"
            },
            {
                title: "testDashboard2"
            }
        ]
    });
    await newUser.save();

    const client = mockserver.agent(app);
    client.set('authorization', newUser._id);

    //when
    const response = await client.get(`/api/dashboards/${newUser.dashboards[0]._id}`)

    //then
    expect(response.body.dashboard.title).toBe("testDashboard");

    await connectionVirtualMongoDb.disconnect();
    await virtualMongoDb.stop();
});

it('should return null if a dashboard with matching _id for a user does not exists.', async () => {
    //given
    const virtualMongoDb = await MongoMemoryServer.create();
    const uri = virtualMongoDb.getUri();
    const connectionVirtualMongoDb = await mongoose.connect(uri);

    const newUser = new User({
        username: "testUser",
        googleId: "testGoogle",
    });
    await newUser.save();

    const client = mockserver.agent(app);
    client.set('authorization', newUser._id);

    //when
    const response = await client.get(`/api/dashboards/invalidId`)

    //then
    expect(response.body.dashboard).toBe(null);

    await connectionVirtualMongoDb.disconnect();
    await virtualMongoDb.stop();
});

it('should return an empty array of todos for a new dashboard.', async () => {
    //given
    const virtualMongoDb = await MongoMemoryServer.create();
    const uri = virtualMongoDb.getUri();
    const connectionVirtualMongoDb = await mongoose.connect(uri);

    const newUser = new User({
        username: "testUser",
        googleId: "testGoogle",
        dashboards: [
            {
                title: "testDashboard"
            }
        ]
    });
    await newUser.save();

    const client = mockserver.agent(app);
    client.set('authorization', newUser._id);

    //when
    const response = await client.get(`/api/dashboards/${newUser.dashboards[0]._id}/todos`)

    //then
    expect(response.body.todos).toStrictEqual([]);

    await connectionVirtualMongoDb.disconnect();
    await virtualMongoDb.stop();
});

it('should return a todo with matching _id from a users dashboard if it exists.', async () => {
    //given
    const virtualMongoDb = await MongoMemoryServer.create();
    const uri = virtualMongoDb.getUri();
    const connectionVirtualMongoDb = await mongoose.connect(uri);

    const newUser = new User({
        username: "testUser",
        googleId: "testGoogle",
        dashboards: [
            {
                title: "testDashboard",
                todos: [
                    {
                        title: "testTodo",
                        content: "testTodoContent"
                    },
                    {
                        title: "testTodo2",
                        content: "testTodoContent2"
                    },
                ]
            }
        ]
    });
    await newUser.save();

    const client = mockserver.agent(app);
    client.set('authorization', newUser._id);

    //when
    const response = await client.get(`/api/dashboards/${newUser.dashboards[0]._id}/todos/${newUser.dashboards[0].todos[0]._id}`)

    //then
    expect(response.body.todo.title).toBe("testTodo");

    await connectionVirtualMongoDb.disconnect();
    await virtualMongoDb.stop();
});

it('should return noll if a todo with matching _id from a users dashboard does not exists.', async () => {
    //given
    const virtualMongoDb = await MongoMemoryServer.create();
    const uri = virtualMongoDb.getUri();
    const connectionVirtualMongoDb = await mongoose.connect(uri);

    const newUser = new User({
        username: "testUser",
        googleId: "testGoogle",
        dashboards: [
            {
                title: "testDashboard",
            }
        ]
    });
    await newUser.save();

    const client = mockserver.agent(app);
    client.set('authorization', newUser._id);

    //when
    const response = await client.get(`/api/dashboards/${newUser.dashboards[0]._id}/todos/invalidTodoId`)

    //then
    expect(response.body.todo).toBe(null);

    await connectionVirtualMongoDb.disconnect();
    await virtualMongoDb.stop();
});

it('should create todo.', async () => {
    //given
    const virtualMongoDb = await MongoMemoryServer.create();
    const uri = virtualMongoDb.getUri();
    const connectionVirtualMongoDb = await mongoose.connect(uri);

    const newUser = new User({
        username: "testUser",
        googleId: "testGoogle",
        dashboards: [
            {
                title: "testDashboard"
            }
        ]
    });
    await newUser.save();

    const client = mockserver.agent(app);
    client.set('authorization', newUser._id);
    //client.set('content-type', "application-JSON");

    //when
    const response = await client.post(`/api/dashboards/${newUser.dashboards[0]._id}/todos`)
        .send({
            title: "testTodo",
            content: "testContent"
    });

    //then
    expect(response.status).toBe(200);
    expect(response.body.dashboards[0].todos).toHaveLength(1);
    expect(response.body.dashboards[0].todos[0]._id).not.toBeNull();

    const userInDb = await User.findById(newUser._id);
    expect(userInDb.dashboards[0].todos).toHaveLength(1);
    expect(userInDb.dashboards[0].todos[0]._id).not.toBeNull();
    expect(userInDb.dashboards[0].todos[0]._id.toString()).toBe(response.body.dashboards[0].todos[0]._id);

    await connectionVirtualMongoDb.disconnect();
    await virtualMongoDb.stop();
});

