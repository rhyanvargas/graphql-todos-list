import React, { useState } from "react";
import { useQuery, gql, useMutation } from "@apollo/client";
import { addTypenameToDocument } from "@apollo/client/utilities";

// list todos
// toggle todos
// add todos
// delete todos

const GET_TODOS = gql`
  query getTodos {
    todos {
      done
      id
      text
    }
  }
`;

const TOGGLE_TODO = gql`
  mutation toggleTodo($id: uuid!, $done: Boolean) {
    update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const ADD_TODO = gql`
  mutation addTodo($text: String) {
    insert_todos(objects: { text: $text }) {
      returning {
        done
        id
        text
      }
    }
  }
`;

const DELETE_TODO = gql `
mutation deleteTodo($id: uuid!) {
  delete_todos(where: {id: {_eq: $id}}) {
    returning {
      done
      id
      text
    }
  }
}

`

function App() {
  const { data, loading, error } = useQuery(GET_TODOS);
  const [toggleTodo] = useMutation(TOGGLE_TODO);
  const [addTodo] = useMutation(ADD_TODO, {
    onCompleted: () => setTodoText('')
  });
  const [deleteTodo] = useMutation(DELETE_TODO);

  const [todoText, setTodoText] = useState("");

  const handleToggleTodo = async ({ id, done }) => {
    const data = await toggleTodo({ variables: { id, done: !done } });
    console.log('toggle todo: ',data);
  };

  const handleDeleteTodo = async (todoId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      const data = await deleteTodo({
        variables: {id: todoId},
        update: cache => {
          const prevData = cache.readQuery({query: GET_TODOS});
          const newData = prevData.todos.filter(todo => todoId !== todo.id)
          cache.writeQuery({query: GET_TODOS,data: {todos:newData}})
        }
      })
      console.log("deletedTodo: ", data)
    }

  }
  

  const handleAddTodo = async (event) => {
    event.preventDefault();
    if(!todoText.trim()) return;

    const data = await addTodo({ 
      variables: { text: todoText } ,
      refetchQueries: [{query: GET_TODOS}] // requires fetching from server
    });
    console.log('add todo: ',data);
    return data
  };

  const handleOnChange = (event) => {
    const { value } = event.target;
    setTodoText(value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error fetching todos</div>;

  const form = (
    <form onSubmit={handleAddTodo} className="mb3">
      <input
        className="pa2 f4 b--dashed"
        type="text "
        placeholder="Write your todo"
        onChange={handleOnChange}
        value={todoText}
      />
      <button className="pa2 f4 bg-green" type="submit">
        Create
      </button>
    </form>
  );

  const displayTodos = (
    <div className="flex items-center justify-center flex-column">
      {data.todos.map((todo) => (
        <p key={todo.id}>
          <span
            onDoubleClick={() => handleToggleTodo(todo)}
            className={`pointer list pa1 f3 ${todo.done && "strike"}`}
          >
            {todo.text}
          </span>
          <button onDoubleClick={() => handleDeleteTodo(todo.id)} className=" bg-transparent f4 bn nt ">
            <span className="red">&times;</span>
          </button>
        </p>
      ))}
    </div>
  );

  return (
    <div className="vh-100 code flex flex-column items-center bg-purple white pa3 ">
      <h1 className="f2-1 ">
        GraphQL Checklist
        <span role="image" aria-label="Checkmark">
          ✅
        </span>
      </h1>
      {form}
      {displayTodos}
    </div>
  );
}

export default App;
