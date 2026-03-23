import { supabase } from "../../supabaseClient";

export async function signIn(email, password){
    if(!email || !password){
        return { error: {message: "Email and password required"}}
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {data, error}
}

export async function signOut(){
    await supabase.auth.signOut()
    navigate("/SignIn")
  }

export async function getUser() {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) return null;
    return data.user
  }

