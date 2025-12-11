# Zustand Coding Guidelines (For Coding Agents)

This project uses **Zustand** for client-side shared state management.

The boundary between state handled by React components and state managed by Zustand is strict.
Always follow the rules below to prevent mixing responsibilities and creating god components/stores.

## 1. State Management Principles

### React Component State
Only "component-local state" should be handled with `useState`.

* **Examples:**
    * Input strings (text input, search text)
    * UI-local flags (modal open/close, hover, enabled/disabled, expanded)
    * Current step in step UI
    * Tab selection (when contained within that component)

> **Criteria:** Not referenced from outside, can be discarded instantly, "state in a closed context"

### Zustand State
All state that is not contained within a component should be aggregated in Zustand stores.

* **Examples:**
    * State referenced from multiple components
    * Filter/sort conditions (when affecting app-wide display)
    * Entity lists and selection state
    * Data being edited (form model)
    * Local cache
    * Logic and state transitions themselves
    * Side effects (fetch, storage, async)

> **Criteria:** The store holds the "correct state" of the application.

---

## 2. Component Responsibilities
React components are responsible for "View only" and should not do anything else.

### What Components CAN Do
* Subscribe to only necessary values from Zustand store using selectors
* Call store actions in event handlers
* Handle only component-local state with `useState`

### What Components CANNOT Do
* Write business logic
* Directly call set/get on Zustand store
* Write data processing, filtering, or aggregation in components
* Perform side effects like fetch / localStorage in components
* Partially read/write Zustand state to shift logic to the component side

---

## 3. Zustand Store Structure

### 1 Store = 1 Domain
Do not mix multiple domains in a single store.
* `useTodoStore`
* `useAuthStore`
* `useLayoutStore`

### Clearly Separate State / Actions / Store

```typescript
// State only
type TodoState = {
  items: Todo[];
  filter: "all" | "active" | "completed";
  loading: boolean;
};

// Actions only
type TodoActions = {
  loadTodos: () => Promise<void>;
  addTodo: (title: string) => void;
  toggleTodo: (id: string) => void;
  setFilter: (filter: TodoState["filter"]) => void;
};

// Store = State + Actions
export type TodoStore = TodoState & TodoActions;
```

### Encapsulate Logic and Side Effects in Actions
All side effects (fetch / async / storage) should be aggregated here. Do not execute directly from components.

```typescript
export const useTodoStore = create<TodoStore>((set, get) => ({
  items: [],
  filter: "all",
  loading: false,

  async loadTodos() {
    set({ loading: true });
    const data = await api.getTodos();
    set({ items: data, loading: false });
  },

  addTodo(title) {
    set({
      items: [...get().items, { id: uuid(), title, done: false }],
    });
  },

  toggleTodo(id) {
    set({
      items: get().items.map(t =>
        t.id === id ? { ...t, done: !t.done } : t
      ),
    });
  },

  setFilter(filter) {
    set({ filter });
  },
}));
```

---

## 4. Component-Side Patterns

```tsx
const items = useTodoStore(s => s.items);
const filter = useTodoStore(s => s.filter);
const toggleTodo = useTodoStore(s => s.toggleTodo);

const onToggle = (id: string) => {
  toggleTodo(id);
};

return (
  <TodoList
    items={items}
    filter={filter}
    onToggle={onToggle}
  />
);
```

> **Note:** Returning objects from selectors creates new references each time and can cause infinite loops. Get actions directly.

**Key Points:**
* Subscribe to only necessary slices with selectors
* Components should not have business logic
* Only call actions

---

## 5. Prohibited Practices (LLMs Take Special Note)
The following are **absolutely prohibited**:

* **God Store**
    * Mixing state from multiple domains in a single store.
* **Writing Business Logic in Components**
    * Do not write filtering, sorting, calculations, or state transitions in the UI.
* **Writing Side Effects in useEffect**
    * All fetch / async / localStorage should be written in the store.
* **Direct setState Operations**
    * `set({ foo: ... })` from components is prohibited. Always go through store actions.
* **Handling Non-Component-Local State with useState**
    * Do not put state that should be shared in `useState`.

---

## 6. Advanced: Dynamic State Pattern

Zustand is primarily a "persistent singleton" state manager and lacks a standard way to handle **application-specific volatile (ephemeral) state**.
However, since managing state that exists only for a specific duration (session, screen lifecycle) is essential, this project uses the **Dynamic State Pattern**.

### 1. Component Lifecycle State (`useDefineDynamicState`)
Use this when you have **volatile state (e.g., Modals, Wizards) and want to share it with descendant components**. It avoids prop drilling while ensuring the state is automatically cleaned up when the component is destroyed.

### 2. Session Lifecycle State (`createDynamicStore` / `removeDynamicStore`)
Use this when you need to explicitly reset or destroy state for temporary sessions, such as "Content Rendering".
