import { useEffect, useState } from "react";
import "./App.css";
import Modal from "react-bootstrap/Modal";
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { ListGroupItem } from "react-bootstrap";
import { urlMapping } from "./EndpointMapping";

function App() {
	const [todoRecs, setTodoRecs] = useState([]);
	const [filteredTodoRecs, setFilteredTodoRecs] = useState([]);
	const [open, setOpenModal] = useState(false);
	const [openDeleteModal, setOpenDeleteModal] = useState(false);
	const [inputValues, setInputValues] = useState({
		'title':'',
		'description':'',
		'id':'',
		"completed":false
	})

	const openModal = () => {
		setOpenModal(true);
	}
	
	const closeModal = () => {
		setOpenModal(false);
	}

	useEffect(() => {
		getTasks('pending', setTodoRecs, setFilteredTodoRecs);
	}, [])

	const filterTasks = (filterString) => {
		let filteredArray = [];
		if(filterString) {
			todoRecs.forEach(task => {
				if(task.title.includes(filterString) || task.description.includes(filterString)) {
					filteredArray.push(
						<div key={task.id}>
						<h4>{task.title}</h4>
						<p>{task.description}</p>
						</div>
					);
				}
			})
		} else {
			todoRecs.forEach(task => {
				filteredArray.push(
					<div key={task.id}>
						<h4>{task.title}</h4>
						<p>{task.description}</p>
					</div>
				);
			})
		}
		setFilteredTodoRecs(filteredArray);
	}

	const getTasks = (type) => {
		let todoArray = [];
		fetch('/api/'+urlMapping[type])
			.then(response => response.json())
			.then(tasks => {
				if(tasks && tasks.length > 0) {
					tasks.forEach(task => {
						todoArray.push(
							<ListGroupItem key={task.id} className="d-flex justify-content-between align-items-start listitem">
								<div className="ms-2 me-auto">
									<div className="fw-bold d-flex justify-content-between align-items-start">{task.title}</div>
									{task.description}
								</div>
								<Button className="button" size="sm" onClick={() => handleUpdate(task)}>Update</Button>
								<Button className="button" size="sm" variant="success" onClick={() => handleComplete(task)}>Complete</Button>
								<Button className="button" size="sm" variant="danger" onClick={() => handleDelete(task)}>Delete</Button>
							</ListGroupItem>
						)
					})
					setTodoRecs(tasks);
					setFilteredTodoRecs(todoArray);
				} else {
					setTodoRecs([])
					setFilteredTodoRecs([]);
				}
			});
	}

	const handleOnChange = (event) => {
		const {name, value} = event.target;
		setInputValues({
			...inputValues,
			[name]: value
		})
		console.log('input values', inputValues);
	}

	const saveTodo = () => {
		console.log('in save todo');
		let action = inputValues.id ? urlMapping['update'] : urlMapping['add'];
		let method = inputValues.id ? 'PUT' : 'POST';
		fetch('/api/'+action,{
			method: method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(inputValues)
		}).then(response => response.json())
		.then(data => {
			console.log('Success:', data);
			getTasks('pending');
		})
		.catch((error) => {
			console.error('Error:', error);
		});
		resetValues();
		closeModal();
	}

	const resetValues = () => {
		setInputValues({});
	}

	const handleUpdate = (task) => {
		console.log('update task', task);
		setInputValues({...task});
		console.log('input values', inputValues);
		openModal();
	}

	const handleDelete = (task) => {
		console.log('update task', task);
		setOpenDeleteModal(true);
		setInputValues({...task});
	}

	// const handleComplete = (task) => {
	// 	console.log('before update task', {...task});
	// 	let completedTask = {...task, completed:true};
	// 	setInputValues(completedTask);
	// 	setTimeout(() => {
	// 		saveTodo();
	// 	}, 0);
	// }

	const handleComplete = (task) => {
        const completedTask = { ...task, completed: true };
        setInputValues(completedTask);
        // Use a callback to ensure the state is updated before calling saveTodo
        setTimeout(() => {
            saveTodo();
        }, 0);
		console.log('end of handle complete')
    }


	return (
		<>
			<div className="inputSection">
				<input type="text" onChange={(e) => filterTasks(e.target.value)} placeholder="Search Todo"/>
				<Button className="button" onClick={openModal}>Add Todo</Button>
			</div>
			<Button className="button" onClick={() => {getTasks('all')}}>All Tasks</Button>
			<Button className="button" onClick={() => {getTasks('pending')}}>Pending Tasks</Button>
			<Button className="button" onClick={() => {getTasks('completed')}}>Completed Tasks</Button>
			<div className="todo-section">
				<div className="todo-header">
					<h3>Todo</h3>
				</div>
				<ListGroup >
					{filteredTodoRecs}
				</ListGroup>
			</div>
			<Modal show={open} onHide={closeModal}>
				<Modal.Header closeButton>
					<Modal.Title>Add Todo</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div style={{display:'flex', flexDirection:'column'}}>
						<input name="title" value={inputValues.title} className="input" type="text" placeholder="Title" onChange={handleOnChange}/>
						<input name="description" value={inputValues.description} className="input" type="text" placeholder="Description" onChange={handleOnChange}/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeModal}>
						Close
					</Button>
					<Button variant="primary" onClick={saveTodo}>Save</Button>
				</Modal.Footer>
      		</Modal>

			<Modal show={openDeleteModal} onHide={closeModal}>
				<Modal.Header closeButton>
					<Modal.Title>Delete Todo</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Are you sure you want to delete?
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={closeModal}>
						Close
					</Button>
					<Button variant="danger" onClick={handleDelete}>Delete</Button>
				</Modal.Footer>
      		</Modal>
		</>
	);
}
export default App;
