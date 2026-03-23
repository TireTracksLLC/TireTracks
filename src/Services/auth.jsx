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
    return await supabase.auth.signOut()
  }

export async function getUser() {
    const { data } = await supabase.auth.getUser();
    return data.user || null
}

