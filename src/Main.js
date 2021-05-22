import React,{useState,useEffect} from 'react'
import { UseContext } from './Context'

//нормальный вывод ошибок в catch
//динамическое изменение данных

const Main=()=>{
const {web3,Contract}=UseContext()
const [Accounts, setAccounts] = useState([])
const [address, setAddress] = useState('')
const [password, setPassword] = useState('')
const [FIO, setFIO] = useState('')
const [experience, setExperience] = useState(0)
const [certificateNum, setCertificateNum] = useState(0)
const [validity, setValidity] = useState([])
const [category, setCategory] = useState('')
const [price, setPrice] = useState(0)
const [lifetime, setLifetime] = useState(0)
const [driverInfo, setDriverInfo] = useState([])
const [certificateInfo, setCertificateInfo] = useState([])
const [vehicleInfo, setVehicleInfo] = useState([])
const [vehiclesList, setVehiclesList] = useState([])
const [message, setMessage] = useState([])
const [messagesList, setMessagesList] = useState([])
//-------------------------------------------------
useEffect(() => {
    const ListAccounts=async()=>{
        let Users= await web3.eth.getAccounts()
        Users[0]="Выберите адрес" //затирает нулевой адрес в списке
        setAccounts(Users)
    }
    ListAccounts()
}, [])
//----------------Регистрация------------------------
const Registration=async(e)=>{
    e.preventDefault()
    try{
        let adr = await web3.eth.personal.newAccount(password)
        let Users = await web3.eth.getAccounts()
        await web3.eth.sendTransaction({from:Users[0], to:adr, gas: 200000, value: 50000000000000000000})
        Users[0]="Выберите адрес" //затирает нулевой адрес в списке
        setAccounts(Users)
        await web3.eth.personal.unlockAccount(adr,password,600)
        await Contract.methods.New_driver(FIO,experience).send({from:adr, gas:200000})
        alert("Вы зарегистрировались, запомните свой адрес: " + adr)
    }catch(e){
        alert(e)
    }
}
const hadleFIO=(e)=>{
    setFIO(e.target.value)
}
const hadleExperience=(e)=>{
    setExperience(e.target.value)
}
const hadlePassword=(e)=>{
    setPassword(e.target.value)
}
//----------------Авторизация------------------------
const Authorisation=async(e)=>{
    e.preventDefault()
    try{
        reLogin()
        await web3.eth.personal.unlockAccount(address, password, 60000)
        sessionStorage.setItem("address",address)
        await GetMessagesList()
        await GetVehiclesList()
        await Contract.methods.Update_balance().send({from:address, gas:100000})
        let dInfo = await Contract.methods.Driver_info(address).call({from:address})
        dInfo[4] = dInfo[4] === "driver" ? "водитель" : "сотрудник ДПС"
        setDriverInfo(dInfo)
        if (dInfo[1] !== "")
            await CertificateUpdate(dInfo)
        alert("Вы авторизовались")
    }catch(e){
        alert(e)
    }
}
const handleAddress=(e)=>{
    setAddress(e.target.value)
}
const reLogin=()=>{
    setDriverInfo("")
    setCertificateInfo("")
    setVehicleInfo("")
}
//----------Просмотр транспортных средств--------------
const GetVehiclesList=async()=>{
    try{
        let vehicles = (await Contract.methods.Get_vehicles().call({from:sessionStorage.getItem("address")}))
        let ownVehicles = [];
        for(let i = 0; i < vehicles.length; i++){
            if(vehicles[i].owner === sessionStorage.getItem('address'))
                ownVehicles.push(vehicles[i])
            }
        setVehiclesList(ownVehicles)
    }catch(e){
        alert(e)
    }
}
const handleVehicle=(e)=>{
    setVehicleInfo(vehiclesList[e.target.value])
}
//----Добавление-водительского-удостоверения------------
const AddCertificate=async(e)=>{
    e.preventDefault()
    try{
        await Contract.methods.Add_certificate(certificateNum, validity[2], validity[1], validity[0], category).send({from:sessionStorage.getItem("address"), gas:300000})
        await GetMessagesList()
        if(driverInfo[1] !== "")
            await CertificateUpdate(driverInfo[1])
        alert("Вы отправили запрос на добавление удостоверения, результат можно просмотреть в системных сообщениях")
    }catch(e){
        alert(e)
    }
}
const CertificateUpdate=async(dInfo)=>{
    let cInfo = await Contract.methods.Certificate_info(dInfo[1]).call({from:address})
    cInfo[0] = await (cInfo[1].length === 1 ? "0" + cInfo[1] : cInfo[1]) + "." + (cInfo[2].length === 1 ? "0" + cInfo[2] : cInfo[2]) + "." + cInfo[3]
    cInfo[1] = (cInfo[4] === true ? "A " : "") + (cInfo[5] === true ? "B " : "") + (cInfo[6] === true ? "C" : "")
    setCertificateInfo(cInfo)
}
const handleCertificateNum=(e)=>{
    setCertificateNum(e.target.value)
}
const handleValidity=(e)=>{
    let val = e.target.value.split('-')
    val[1] = Number(val[1])
    val[2] = Number(val[2])
    setValidity(val)
}
const handleCategory=(e)=>{
    setCategory(e.target.value)
}
//---------Регистрация-транспортного-средства-----------
const AddVehicle=async(e)=>{
    e.preventDefault()
    try{
        await Contract.methods.Add_vehicle(category, price, lifetime).send({from:sessionStorage.getItem("address"), gas:200000})
        await GetVehiclesList()
        await GetMessagesList()
        alert("Вы отправили запрос на регистрацию транспорта, результат можно просмотреть в системных сообщениях")
    }catch(e){
        alert(e)
    }
}
const handlePrice=(e)=>{
    setPrice(e.target.value)
}
const handleLifetime=(e)=>{
    setLifetime(e.target.value)
}
//Запрос-на-продление-срока-действия-водительского-удостоверения--
const IncreaseValidity=async(e)=>{
    e.preventDefault()
    try{
        await Contract.methods.Increase_validity().send({from:sessionStorage.getItem("address"), gas:100000})
        await GetMessagesList()
        alert("Вы отправили запрос на продление водительского удостоверения, результат можно просмотреть в системных сообщениях")
    }catch(e){
        alert(e)
    }
}
//----------------Получение сообщений-------------------
const GetMessagesList=async()=>{
    try{
        let messages = (await Contract.methods.Get_messages().call({from:sessionStorage.getItem("address")}))
        let receivedMessages = [];
        for(let i = 0; i < messages.length; i++){
            if(messages[i].receiver === sessionStorage.getItem('address'))
                receivedMessages.push(messages[i].content)
            }
        setMessagesList(receivedMessages)
    }catch(e){
        alert(e)
    }
}
const handleMessage=(e)=>{
    setMessage(messagesList[e.target.value])
}
//---------------Добавление категории-------------------
const AddCategory=async(e)=>{
    e.preventDefault()
    try{
        await Contract.methods.Add_category(category).send({from:sessionStorage.getItem("address"), gas:150000})
        await GetMessagesList()
        await CertificateUpdate(driverInfo)
        alert("Вы отправили запрос на добавление категории, результат можно просмотреть в системных сообщениях")
    }catch(e){
        alert(e)
    }
}
//------------------------------------------------------

return(
<>
<h4>Регистрация</h4>
<form onSubmit={Registration}>
    <input required onChange = {hadleFIO} placeholder = "ФИО"></input>
    <input required type = "number" onChange = {hadleExperience} placeholder = "Водительский стаж"></input>
    <input required type = "password" onChange = {hadlePassword} placeholder = "Пароль"></input>
    <button>Зарегистрироваться</button>
</form>

<h4>Авторизация</h4>
<form onSubmit={Authorisation}>
        <select onChange = {handleAddress}>
        {Accounts.map((arr,i)=><option key={i} value={String(arr)}>{arr}</option>)}
    </select>
    <input required onChange = {hadlePassword} placeholder = "Пароль"></input>
    <button>Авторизоваться</button>
</form>
<hr align="center" width="100%" size="5" color="#dddddd" />

<div>
    <label> Текущий пользователь: </label> {sessionStorage.getItem("address")} <br/>
    <label> ФИО: </label> {driverInfo[0]} <br/>
    <label> Водительский стаж: </label> {driverInfo[2]} <br/>
    <label> Баланс: </label> {driverInfo[3]} <br/>
    <label> Роль: </label> {driverInfo[4]} <br/>
    <br/>
    <label> Удостоверение № </label> {driverInfo[1]} <br/>
    <label> Срок действия: </label> {certificateInfo[0]} <br/>
    <label> Категории: </label> {certificateInfo[1]} <br/>
</div>

<h4>Транспортные средства</h4>
<select onChange={handleVehicle}>
    <option disabled selected>Выберите ТС</option>
    {vehiclesList.map((arr,i)=><option key={i} value={i}>{i}</option>)}
</select>
<br/>

<label> Категория: </label> {vehicleInfo[0]} <br/>
<label> Рыночная стоимость: </label> {vehicleInfo[1]} <br/>
<label> Срок эксплуатации: </label> {vehicleInfo[2]} <br/>

<hr align="center" width="100%" size="5" color="#dddddd" />

<h4>Системные сообщения</h4>
    <select onChange={handleMessage}>
        <option disabled selected>Выберите сообщение</option>
        {messagesList.map((arr,i)=><option key={i} value={i}>{i}</option>)}
    </select>
    <label> Сообщение: </label> {message} <br/>
<hr align="center" width="100%" size="5" color="#dddddd" />

<h4>Добавление водительского удостоверения</h4>
<form onSubmit={AddCertificate}>
    <input required onChange = {handleCertificateNum} placeholder = "Номер удостоверения"></input>
    <input required type = "date" onChange = {handleValidity} placeholder = "Дата окончания действия"></input>
    <input required onChange = {handleCategory} placeholder = "Категория"></input>
    <button>Отправить запрос</button>
</form>

<h4>Регистрация транспорта</h4>
<form onSubmit={AddVehicle}>
    <input required onChange = {handleCategory} placeholder = "Категория"></input>
    <input required type = "number" onChange = {handlePrice} placeholder = "Рыночная стоимость(wei)"></input>
    <input required type = "number" onChange = {handleLifetime} placeholder = "Срок эксплуатации(лет)"></input>
    <button>Отправить запрос</button>
</form>

<h4>Продление срока действия водительского удостоверения</h4>
<form onSubmit={IncreaseValidity}>
    <button>Отправить запрос</button>
</form>

<h4>Добавление категории</h4>
<form onSubmit={AddCategory}>
    <input required onChange = {handleCategory} placeholder = "Категория"></input>
    <button>Отправить запрос</button>
</form>

</>
)
}

export default Main