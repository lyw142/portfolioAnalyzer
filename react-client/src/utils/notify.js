import { toast } from "react-toastify";

export const notify = (type, message) => {
    if (type === 'success') {
        toast.success(message, {
            autoClose: 2000
        });
    } else if (type === 'error') {
        toast.error(message, {
            autoClose: 2000
        });
    } else if (type === 'info') {
        toast.info(message, {
            autoClose: 2000
        });
    }
};