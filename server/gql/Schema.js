const { driver } = require('../neo4j')
const { OGM } = require('@neo4j/graphql-ogm')
const { gql } = require('apollo-server-express')
const { encryptPassword, createJWT, comparePassword } = require('../utils')


const typeDefs = gql`
type User{
    id:ID @id
    firstname:String!
    lastname:String!
    email:String! 
    username:String!
    password:String! @private
    createdAt:DateTime! @timestamp(operations:[CREATE])
    updatedAt:DateTime @timestamp(operations:[UPDATE])
    posts:[Post] @relationship(type:"POSTED", direction:OUT)
    residence:Location @relationship(type:"LIVES_IN", direction:OUT)
    business:[Business] @relationship(type:"OWNS", direction:OUT)
    review:[Review] @relationship(type:"WROTE", direction:OUT)
    likesPost:[Post] @relationship(type:"LIKES", direction:OUT)
    likesPost:[Comment] @relationship(type:"LIKES", direction:OUT)
    comment:[Comment] @relationship(type:"COMMENTED", direction:OUT)
}

extend type User @auth(rules:[
{
    operations:[UPDATE],
    isAuthenticated:true,
    allow:{
        id:"$jwt.sub"
    }
}
]),


type Post{
    id:ID! @id
    content:String!
    author:User @relationship(type:"POSTED",direction:IN)
    createdAt:DateTime @timestamp(operations:[CREATE])
    updatedAt:DateTime @timestamp(operations:[UPDATE])
    likesPost:[User] @relationship(type:"LIKES", direction:IN)
    comments:[Comment] @relationship(type:"ON", direction:IN)
}

extend type Post @auth(rules: [
{
    operations:[CREATE,UPDATE,DELETE,READ],
    isAuthenticated: true,
 },

 {
    operations:[UPDATE,DELETE],
    allow:{
        id:"$jwt.sub"
    }
 },
 ]),

type Comment{
    id:ID! @id
    content:String!
    author:User @relationship(type:"COMMENTED",direction:IN)
    createdAt:DateTime @timestamp(operations:[CREATE])
    updatedAt:DateTime @timestamp(operations:[UPDATE])
    likesComment:[User] @relationship(type:"LIKES", direction:IN)
    post:Post! @relationship(type:"ON", direction:OUT)
}

extend type Comment @auth(rules: [
{
    operations:[CREATE,UPDATE,DELETE,READ],
    isAuthenticated: true,
 },

 {
    operations:[UPDATE,DELETE],
    allow:{
        id:"$jwt.sub"
    }
 },
 ]),

type Business{
    id:ID! @id
    name:String!
    createdAt:DateTime! @timestamp(operations:[CREATE])
    updatedAt:DateTime @timestamp(operations:[UPDATE])
    category:[Category!] @relationship(type:"IN_CATEGORY", direction:OUT)
    location:Location! @relationship(type:"LOCATED_IN", direction:OUT)
    owner:User! @relationship(type:"OWNS", direction:IN)
    reviews:Review @relationship(type:"ABOUT", direction:IN)
}

type Freelance{
    id:ID! @id
    title:String!
    createdAt:DateTime! @timestamp(operations:[CREATE])
    updatedAt:DateTime @timestamp(operations:[UPDATE])
    location:Location! @relationship(type:"LOCATED_IN", direction:OUT)
    skills:[Skills]! @relationship(type:"HAS_SKILL", direction:IN)
    reviews:[Review] @relationship(type:"ABOUT",direction:IN)
}

type Skills{
    id:ID! @id
    name:String!
    freelance:Freelance @relationship(type:"HAS_SKILL", direction:IN)
}

type Category{
    id:ID! @id
    name:String!
    business:[Business]@relationship(type:"IN_CATEGORY", direction:IN)
}

type Review{
    id:ID! @id
    title:String!
    text:String!
    rating:Int
    createdAt:DateTime! @timestamp(operations:[CREATE])
    updatedAt:DateTime @timestamp(operations:[UPDATE])
    business:Business! @relationship(type:"ABOUT", direction:OUT)
    author:User! @relationship(type:"WROTE",direction:IN)
}
extend type Review @auth(
    rules:[{
        operations:[CREATE,DELETE,UPDATE],
        isAuthenticated:true,
        allow:{
            id:"$jwt.sub"
        }
    }]
),

type Town{
    id:ID! @id
    name:String!
    location:[Location] @relationship(type:"IN_CITY", direction:IN)
}

type Location{
    id:ID!
    name:String!
    coordinates:Point!
    town:Town @relationship(type:"IN_CITY", direction:OUT)
    user:[User] @relationship(type:"LIVES_IN", direction:IN)
    business:[Business] @relationship(type:"LOCATED_IN",direction:IN)
    freelance:[Freelance] @relationship(type:"LACATED_IN", direction:IN)
}

type Mutation{
    signUp(firstname:String!,lastname:String!,email:String!,username:String!,password:String!):String! ##token
    signIn(email:String!,password:String!):String ##token
}



`

const ogm = new OGM({
    typeDefs,
    driver
})

const User = ogm.model('User')
const resolvers = {
    Mutation: {
        async signUp(root, { firstname, lastname, email, username, password }) {
            const [existing] = await User.find({
                where: { email }
            });
            if (existing) {
                throw new Error('User With Than Email Already Exist')
            }

            const [existing1] = await User.find({
                where: {
                    username
                }
            })
            if (existing1) {
                throw new Error('Username Already Taken')
            }

            const hashedPassword = await encryptPassword(password);

            if (hashedPassword) {
                const [user] = (await User.create(
                    {
                        input: {
                            firstname,
                            lastname,
                            email,
                            username,
                            password: hashedPassword
                        }
                    }
                )).users
                return await createJWT({
                    sub: user.id
                })
            }
        },
        async signIn(root, { email, password }) {
            const [existing] = await User.find({
                where: {
                    email
                }
            })

            if (!existing) {
                throw new Error("User not found")
            }
            const compare = await comparePassword(password, existing.password)
            if (!compare) {
                throw new Error("Not Authorized")
            }
            return await createJWT({
                sub: existing.id
            })
        }
    }
}



exports.Schema = {
    typeDefs,
    resolvers
}