"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Trash2, Check, X, LayoutList, Rows3 } from "lucide-react";

const STORAGE_KEY = "finac_todos";

function getStorageTodos() {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setStorageTodos(todos) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }
}

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [showTable, setShowTable] = useState(true);

  useEffect(() => {
    setTodos(getStorageTodos());
  }, []);

  useEffect(() => {
    setStorageTodos(todos);
  }, [todos]);

  const handleAddTodo = () => {
    if (newTodo.trim() === "") return;
    const newItem = {
      id: Date.now().toString(),
      text: newTodo,
      completed: false,
    };
    const nextTodos = [...todos, newItem];
    setTodos(nextTodos);
    setNewTodo("");
  };

  const handleDelete = (id) => {
    const nextTodos = todos.filter((t) => t.id !== id);
    setTodos(nextTodos);
    if (editId === id) {
      setEditId(null);
      setEditText("");
    }
  };

  const handleEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const handleSaveEdit = (id) => {
    const nextTodos = todos.map((t) =>
      t.id === id ? { ...t, text: editText } : t
    );
    setTodos(nextTodos);
    setEditId(null);
    setEditText("");
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setEditText("");
  };

  const handleToggleComplete = (id) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const renderTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Done</TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {todos.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={3}
              className="text-center text-muted-foreground py-8"
            >
              No todos yet!
            </TableCell>
          </TableRow>
        ) : (
          todos.map((todo) => (
            <TableRow
              key={todo.id}
              className={todo.completed ? "opacity-60" : ""}
            >
              <TableCell>
                <Button
                  variant={todo.completed ? "secondary" : "outline"}
                  className="p-2"
                  aria-label="toggle complete"
                  onClick={() => handleToggleComplete(todo.id)}
                >
                  {todo.completed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                {editId === todo.id ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="mr-2"
                  />
                ) : (
                  <span className={todo.completed ? "line-through" : ""}>
                    {todo.text}
                  </span>
                )}
              </TableCell>
              <TableCell>
                {editId === todo.id ? (
                  <>
                    <Button
                      size="sm"
                      className="mr-1"
                      onClick={() => handleSaveEdit(todo.id)}
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mr-1"
                      onClick={() => handleEdit(todo.id, todo.text)}
                      aria-label="edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(todo.id)}
                      aria-label="delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  const renderCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {todos.length === 0 ? (
        <Card className="col-span-full">
          <CardContent className="py-6 text-center text-muted-foreground">
            No todos yet!
          </CardContent>
        </Card>
      ) : (
        todos.map((todo) => (
          <Card key={todo.id} className={todo.completed ? "opacity-60" : ""}>
            <CardHeader className="flex flex-row justify-between items-center">
              <span className="font-medium">
                {editId === todo.id ? (
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  <span className={todo.completed ? "line-through" : ""}>
                    {todo.text}
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant={todo.completed ? "secondary" : "outline"}
                  className="p-2"
                  aria-label="toggle complete"
                  onClick={() => handleToggleComplete(todo.id)}
                >
                  {todo.completed ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
                {editId === todo.id ? (
                  <>
                    <Button size="sm" onClick={() => handleSaveEdit(todo.id)}>
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(todo.id, todo.text)}
                      aria-label="edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(todo.id)}
                      aria-label="delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            {/* Extra content on card if needed */}
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="container mx-auto max-w-2xl mt-10">
      <div className="flex items-center mb-6 justify-between">
        <h1 className="text-2xl font-bold">To-Do List</h1>
        <Button
          variant="outline"
          onClick={() => setShowTable((prev) => !prev)}
          size="sm"
        >
          {showTable ? (
            <>
              <Rows3 className="w-4 h-4 mr-2" /> Card View
            </>
          ) : (
            <>
              <LayoutList className="w-4 h-4 mr-2" /> Table View
            </>
          )}
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Add a new todo..."
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAddTodo();
          }}
          className="flex-1"
        />
        <Button onClick={handleAddTodo}>Add</Button>
      </div>

      <div>{showTable ? renderTable() : renderCards()}</div>
    </div>
  );
}
