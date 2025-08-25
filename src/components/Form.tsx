

const Form = () => {
    function handleSubmit(){

    }
  return (
    <div className="flex items-center h-[100vh]">
        <form className="max-w-170 flex flex-col gap-2 justify-center items-center mx-auto" onSubmit={handleSubmit}>
            <div className="w-100">
                <div className="flex flex-col " id='first-div'>
                    <label htmlFor="user-name">Username</label>
                    <input className="border p-1.5" type="text" id='user-name'/>
                </div>
                <div className="flex flex-col " id='second-div'>
                    <label htmlFor="user-name">Email</label>
                    <input className="border p-1.5" type="email" id='user-email'/>
                </div>
                <div className="flex flex-col " id='third-div'>
                    <label htmlFor="user-password">Password</label>
                    <input className="border p-1.5" type="password" id='user-password'/>
                </div>
            </div>
            <input className="border px-4 py-1 rounded" type="submit" value={"Register"}/>
        </form>
    </div>
  )
}

export default Form