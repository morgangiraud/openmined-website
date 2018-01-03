import { SERVERLESS_API_URL, WORDPRESS_API_URL } from './index';

export const GET_CONTENT = 'homepage/GET_CONTENT';
export const GET_GITHUB_PROJECTS = 'homepage/GET_GITHUB_PROJECTS';
export const GET_GITHUB_MEMBERS = 'homepage/GET_GITHUB_MEMBERS';

// TODO: Maybe we should beef this out a bit once we want on the desired format...
const initialState = {
  isLoading: true,
  content: {
    hero: {
      button: {},
      console: {}
    },
    mission: {},
    process: {},
    timeline: {
      button: {}
    },
    footer: {
      questions: {},
      movement: {
        movement_github: {},
        movement_slack: {},
        movement_newsletter: {}
      }
    }
  }
};

export default (state = initialState, action) => {
  switch (action.type) {
    case GET_CONTENT:
      return {
        ...state,
        content: action.content,
        isLoading: false
      };

    // TODO: Is there a prettier way to do this?
    case GET_GITHUB_PROJECTS:
      return {
        ...state,
        content: {
          ...state.content,
          timeline: {
            ...state.content.timeline,
            repos: action.repos
          }
        }
      };

    // TODO: Is there a prettier way to do this?
    case GET_GITHUB_MEMBERS:
      return {
        ...state,
        content: {
          ...state.content,
          footer: {
            ...state.content.footer,
            movement: {
              ...state.content.footer.movement,
              movement_github: {
                ...state.content.footer.movement.movement_github,
                footer_movement_github_members: action.members
              }
            }
          }
        }
      };

    default:
      return state;
  }
};

const formatContent = (content, out, _lead) => {
  Object.keys(content).forEach(val => {
    let parts = val.split('_');
    let lead = parts.shift();

    while (lead === _lead) {
      lead = parts.shift();
    }

    let trail = parts.join('_');

    if (typeof out[lead] === 'undefined') {
      out[lead] = {};
    }

    if (Array.isArray(content[val])) {
      out[lead][trail] = content[val];
    } else if (content[val] !== null && typeof content[val] === 'object') {
      return formatContent(content[val], out[lead], lead);
    }

    out[lead][trail] = content[val];
  });
};

export const getContent = () => {
  return dispatch => {
    fetch(WORDPRESS_API_URL + '/acf/v2/options')
      .then(response => response.json())
      .then(response => {
        let content = {};

        formatContent(response.acf, content);

        console.log('finished', content);

        // // Load content from Wordpress
        // dispatch({
        //   type: GET_CONTENT,
        //   content
        // });
        //
        // // Load Github issues and contributors from Serverless
        // getGithubProjects(content.timeline.repos).then(({ repos }) => {
        //   dispatch({
        //     type: GET_GITHUB_PROJECTS,
        //     repos
        //   });
        // });
        //
        // // Load Github members from Serverless
        // getGithubMembers().then(({ members }) => {
        //   dispatch({
        //     type: GET_GITHUB_MEMBERS,
        //     members
        //   });
        // });
      });
  };
};

const getGithubProjects = repos => {
  return fetch(SERVERLESS_API_URL + '/projects', {
    method: 'POST',
    body: JSON.stringify({
      repos
    })
  }).then(response => response.json());
};

const getGithubMembers = () => {
  return fetch(SERVERLESS_API_URL + '/members').then(response =>
    response.json()
  );
};
