
import GeneralInput from "../forms/GeneralInput"
import CardBasedText from "../cards/CardBasedText"
import PrimaryButton from "../button/PrimaryButton"

export default function Form() {
  return (
    <form className="grid gap-5">
    <section className="grid lg:grid-cols-2 gap-2">
        <div>
            <CardBasedText className="font-medium">Email</CardBasedText>
            <GeneralInput disabled/>
        </div>
        <div>
            <CardBasedText className="font-medium">Role</CardBasedText>
            <GeneralInput disabled/>
        </div>
    </section>
     <section className="grid lg:grid-cols-2 gap-2">
        <div>
            <CardBasedText className="font-medium">Province</CardBasedText>
            <GeneralInput disabled/>
        </div>
    </section>
    <section className="grid lg:grid-cols-2 gap-3">
        <div>
            <CardBasedText className="font-medium">Full Name</CardBasedText>
            <GeneralInput placeholder="Enter your full name"/>
        </div>
        <div>
            <CardBasedText className="font-medium">Phone Number</CardBasedText>
            <GeneralInput placeholder="Enter your phone number"/>
        </div>
    </section>
    <section className="grid lg:grid-cols-2 gap-3">
        <div>
            <CardBasedText className="font-medium">Organization Name</CardBasedText>
            <GeneralInput placeholder="Enter your organization name"/>
        </div>
        <div>
            <span className="flex justify-between">
            <CardBasedText className="font-medium">Secondary Phone Number</CardBasedText>
            <CardBasedText className="text-gray-500 text-xs">Optional</CardBasedText>
            </span>
            <GeneralInput placeholder="Enter your contact person"/>
        </div>
    </section>
    <section className="grid lg:grid-cols-2 gap-3">
        <div>
            <CardBasedText className="font-medium">Password</CardBasedText>
            <GeneralInput placeholder="Enter your organization name"/>
        </div>
        <div>
            <CardBasedText className="font-medium">Confirm Password</CardBasedText>
            <GeneralInput placeholder="Enter your contact person"/>
        </div>
    </section>
    <PrimaryButton>Register Account</PrimaryButton>
    </form>
  )
}
