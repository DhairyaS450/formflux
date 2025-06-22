from huggingface_hub import hf_hub_download

model_file = hf_hub_download(
    repo_id="a8nova/gemma-2b-it-gpu-int8",
    filename="gemma-2b-it-gpu-int8.bin"
)
print("Downloaded to:", model_file)