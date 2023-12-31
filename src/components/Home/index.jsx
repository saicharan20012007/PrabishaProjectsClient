import React from "react"
import { Navigate } from "react-router-dom"
import Cookies from "js-cookie"
import { CgOptions } from "react-icons/cg"
import { Oval } from "react-loader-spinner"
import Tippy from "@tippyjs/react"
import { toast } from "react-hot-toast"
import Popup from "reactjs-popup"

import Navbar from "../Navbar"
import TaskHeader from "../TaskHeader"
import TaskForm from "../TaskForm"

import "./index.css"
import "tippy.js/dist/tippy.css"

const Home = () => {
  const [activeTitle, setActiveTitle] = React.useState("")
  const [activeFilters, setActiveFilters] = React.useState([])
  const [edit, toggleEdit] = React.useState(false)
  const [activeEdit, setActiveEdit] = React.useState(null)
  const [tasks, setTasks] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [btnLoad, setBtnLoad] = React.useState(false)
  const fetchTasks = React.useRef(null)
  const editRef = React.useRef(null)
  const updateRef = React.useRef(null)
  const token = Cookies.get("token")
  if (!token) {
    return <Navigate to="/login" />
  }

  const userDetails = JSON.parse(localStorage.getItem("user"))
  const { name } = userDetails

  //Update task
  const handleTaskData = async (data) => {
    setBtnLoad(true)
    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    }

    const response = await fetch(
      `https://pps-atr8.onrender.com/api/tasks/update/${data.id}`,
      options
    )
    const json = await response.json()
    if (response.ok) {
      setBtnLoad(false)
      toast.success("Task Updated")
      updateRef.current.close()
      fetchTasks.current()
    } else {
      setBtnLoad(false)
      toast.error(json.message)
    }
  }

  //Filter tasks
  const filteredTasks = tasks.filter((task) => {
    if (activeTitle === "" && activeFilters.length === 0) {
      return task
    } else if (
      task.company.toLowerCase().includes(activeTitle.toLowerCase()) &&
      activeFilters.length === 0
    ) {
      return task
    } else if (activeTitle === "" && activeFilters.length > 0) {
      if (activeFilters.includes("Today")) {
        const today = new Date()
        const dueDate = new Date(task.createdAt)
        return (
          dueDate.getDate() === today.getDate() &&
          dueDate.getMonth() === today.getMonth() &&
          dueDate.getFullYear() === today.getFullYear()
        )
      } else if (activeFilters.includes("Yesterday")) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const dueDate = new Date(task.dueDate)
        return (
          dueDate.getDate() === yesterday.getDate() &&
          dueDate.getMonth() === yesterday.getMonth() &&
          dueDate.getFullYear() === yesterday.getFullYear()
        )
      } else {
        return activeFilters.includes(task.status)
      }
    } else if (
      task.title.toLowerCase().includes(activeTitle.toLowerCase()) &&
      activeFilters.length > 0
    ) {
      return activeFilters.includes(task.status)
    } else {
      return null
    }
  })

  //Delete task
  const deleteTask = async (task) => {
    setBtnLoad(true)
    const options = {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }

    const response = await fetch(
      `https://pps-atr8.onrender.com/api/tasks/delete/${task._id}`,
      options
    )
    const json = await response.json()
    if (response.ok) {
      toast.success("Task Deleted")
      fetchTasks.current()
      setBtnLoad(false)
    } else {
      toast.error(json.message)
      setBtnLoad(false)
    }
  }

  const handleSearchTitle = (e) => {
    setActiveTitle(e)
  }

  const handleActiveFilters = (e, checked) => {
    if (checked) {
      setActiveFilters([...activeFilters, e])
    } else {
      setActiveFilters((prev) => prev.filter((item) => item !== e))
    }
  }

  const statusColor = (status) => {
    switch (status) {
      case "Completed":
        return "completed"
      case "In Progress":
        return "in-progress"
      case "Pending":
        return "pending"
      default:
        return ""
    }
  }
  const priorityColor = (status) => {
    switch (status) {
      case "High":
        return "high"
      case "Low":
        return "low"
      default:
        return ""
    }
  }

  //close edit when clicked outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (editRef.current && editRef.current !== event.target) {
        toggleEdit(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  //fetch user tasks
  React.useEffect(() => {
    setLoading(true)
    fetchTasks.current = async () => {
      const api = `https://pps-atr8.onrender.com/api/tasks/get/${userDetails.id}`
      const response = await fetch(api, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setTasks(data.tasks)

      if (response.ok) {
        setLoading(false)
      }
    }
    fetchTasks.current()
  }, [])

  return (
    <div className="home-container">
      <Navbar />
      <div className="home-main">
        <div className="greeting-container">
          <p className="greeting-msg">Hi {name.split(" ")[0]},</p>
          <h1>
            Welcome Back <span className="wave">👋🏻</span>
          </h1>
        </div>
        <div className="task-container">
          <TaskHeader
            handleSearchTitle={handleSearchTitle}
            handleActiveFilters={handleActiveFilters}
            activeFilters={activeFilters}
            fetchTasks={fetchTasks}
          />
          <div className="task-list-container">
            {loading ? (
              <div className="loader-container">
                <Oval
                  height={55}
                  width={55}
                  color="#000"
                  wrapperStyle={{}}
                  wrapperClass=""
                  visible={true}
                  ariaLabel="oval-loading"
                  secondaryColor="#fff"
                  strokeWidth={2}
                  strokeWidthSecondary={2}
                />
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="no-task-container">
                <h2 className="no-task-msg">No Tasks Found ☹️</h2>
              </div>
            ) : (
              filteredTasks.map((task, i) => (
                <div className="task-card" key={task._id}>
                  <div>
                    <div className="task-card-header">
                      <div className="title-container">
                        <p><b>Company: </b>{task.company}</p>
                       
                        <div className="edit-container">
                        <CgOptions
                          className="edit-icon"
                          onClick={() => {
                            toggleEdit(!edit)
                            setActiveEdit(i)
                          }}
                        />

                        <div
                          className={`edit-popup-container ${
                            edit && activeEdit === i ? "display-edit" : ""
                          }`}
                          ref={editRef}
                        >
                          <Popup
                            modal
                            trigger={
                              <button type="button" className="edit-popup-btn">
                                Edit
                              </button>
                            }
                            ref={updateRef}
                          >
                            <TaskForm
                              handleTaskData={handleTaskData}
                              loading={btnLoad}
                              type="edit"
                              task={task}
                            />
                          </Popup>
                          <Popup
                            modal
                            trigger={
                              <button type="button" className="edit-popup-btn">
                                Delete
                              </button>
                            }
                            ref={updateRef}
                          >
                            <div className="delete-popup-container">
                              <h3>
                                Are you sure you want to delete this task?
                              </h3>
                              <div className="delete-popup-btn-container">
                                <button
                                  type="button"
                                  className="delete-popup-btn"
                                  onClick={() => deleteTask(task)}
                                >
                                  {btnLoad ? (
                                    <Oval
                                      height={15}
                                      width={15}
                                      color="#000"
                                      wrapperStyle={{}}
                                      wrapperClass=""
                                      visible={true}
                                      ariaLabel="oval-loading"
                                      secondaryColor="#fff"
                                      strokeWidth={2}
                                      strokeWidthSecondary={2}
                                    />
                                  ) : (
                                    "Yes"
                                  )}
                                </button>
                                <button
                                  type="button"
                                  className="delete-popup-btn"
                                  onClick={() => updateRef.current.close()}
                                >
                                  No
                                </button>
                              </div>
                            </div>
                          </Popup>
                        </div>
                      </div>
                       
                      </div>
                     
                    </div>
                    <p><b>Contact: </b>{task.contact}</p>
                    <p><b>City: </b>{task.city}</p>
                    <p><b>Project: </b>{task.project}</p>
                    <p><b>Category: </b>{task.category}</p>
                    <p><b>Quantity: </b>{task.quantity}</p>
                    <p><b>Tasks: </b>{task.tasks}</p>
                    <p className="start-icon">
                            <b>Start Date:</b> {" "}
                            {new Date(task.startDate).toLocaleString("en-us", {
                              day: "numeric",
                              month: "short",
                              year: "2-digit",
                            })}
                          </p>
                          <p className="due-icon">
                            <b>Planned End Date: </b> {" "}
                            {new Date(task.plannedEndDate).toLocaleString("en-us", {
                              day: "numeric",
                              month: "short",
                              year: "2-digit",
                            })}
                          </p>
                          <p className="due-icon">
                            <b>Actual End Date:</b> {" "}
                            {new Date(task.actualEndDate).toLocaleString("en-us", {
                              day: "numeric",
                              month: "short",
                              year: "2-digit",
                            })}
                          </p>
                    <p><b>Latest Update: </b>{task.latestUpdate}</p>
                  </div>
                  
                  <div className="task-card-footer">
                  <div
                          className={`task-status ${statusColor(task.status)}`}
                        >
                          {task.status}
                        </div>


                        <div
                          className={`task-status ${priorityColor(task.priority)}`}
                        >
                          {task.priority}
                        </div>


                    <div>
                      {task.assignedUser !== task.createdBy && (
                        <Tippy content={task.assignedUser}>
                          <div className="task-profile-icon-2">
                            {task.assignedUser
                              .split(" ")
                              .slice(0, 2)
                              .map((item) => item[0])}
                          </div>
                        </Tippy>
                      )}
                      <Tippy content={task.createdBy}>
                        <div className="task-profile-icon">
                          {task.createdBy
                            .split(" ")
                            .slice(0, 2)
                            .map((item) => item[0].toUpperCase())}
                        </div>
                      </Tippy>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
