import { graphql } from 'react-apollo';
import { getConnectedUser } from '../graphql/queries';
import { User } from '../types';
import ApolloClient from 'apollo-client';

interface Response {
  me: User;
}
interface InputProps {
  client: ApolloClient<{ user: User }>;
}
interface Variables {}

export const withConnectedUser = graphql<InputProps, Response, Variables, {}>(getConnectedUser, {
  props: ({ data, ownProps }) => {
    return {
      user: data && data.me,
      userError: data && data.error,
      resetOnLogout: async () => ownProps.client.resetStore(),
    };
  },
});
