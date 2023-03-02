import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { nanoid } from "nanoid";
import { events, locations, users, participants } from "./data.js";
const typeDefs = `#graphql

  type Events {
   id:ID!
   title:String!
   desc:String!
   date:String!
   from:String!
   to:String!
   location_id:ID!
   user_id:ID!
   users: Users!
    locations:Locations!
    participants:[Participants!]!
   }

   type Locations {
    id:ID!
    name:String!
    desc:String!
    lat:Float!
    lng:Float!
   }

   type Users{
    id:ID!
    username:String!
    email:String!
    events:[Events!]!
   }

   input CreateUserInput{
    username:String!
    email:String!
   }

   type Participants{
    id:ID!
    user_id:ID!
    event_id:ID!
   }

  type Query {
    users:[Users!]!
    user(id:ID!):Users!
    events:[Events!]!
    event(id:ID!):Events!
    locations:[Locations!]!
    location(id:ID!):Locations!
    participants:[Participants!]!
    participant(id:ID!):Participants!
  }

  type Mutation {
    #user
    createUser(data:CreateUserInput!):Users!
  }
`;

const resolvers = {
  Mutation: {
    //users
    createUser: (parent, { data }) => {
      const user = {
        id: nanoid(),
        ...data,
      };
      users.push(user);
      return user;
    },
  },
  Query: {
    users: () => users,
    user: (parent, args) => users.find((user) => user.id == args.id),
    events: () => events,
    event: (parent, args) => events.find((event) => event.id == args.id),
    participants: () => participants,
    participant: (parent, args) =>
      participants.find((participant) => participant.id == args.id),
    locations: () => locations,
    location: (parent, args) =>
      locations.find((location) => location.id == args.id),
  },

  Users: {
    events: (parent) => events.filter((event) => event.user_id == parent.id),
  },
  Events: {
    users: (parent) => users.find((user) => user.id == parent.user_id),
    locations: (parent) =>
      locations.find((location) => location.id === parent.user_id),
    participants: (parent) =>
      participants.filter(
        (participant) => participant.user_id == parent.user_id
      ),
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
