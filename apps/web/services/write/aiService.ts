export async function completePost(instruction: any, idea: string) {
  try {
    const response = await fetch(`/api/openai/completePost`, {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ instruction, idea }),
    });
    if (!response.ok) {
      const errorStatus = await response.json().catch(() => ({ message: 'unknown' }));
      console.error(errorStatus);
      return null;
    }
    const responseData = await response.json();
    return responseData;
  } catch (err) {
    console.error("completePost error", err);
    return null;
  }
}
