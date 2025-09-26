import { useState,useEffect } from "react";
import axios from "axios";
import Datetime from "react-datetime";
import { Link,useParams } from "react-router-dom";
import { LS,ipadr } from "../Utils/Resuse";
import { toast, ToastContainer } from "react-toastify";

 const TaskDetails=()=>{
    const[taskdata,SetTaskdata]=useState([{
        userid :'',
        task:'',
        date:'',
        due_date:'',
        status:'',
        
    }]);

    const {id}=useParams();


   

 }

 export default TaskDetails;
