import GeneralCard from "@/components/cards/GeneralCard"
import UsersProfile from "./components/UsersProfile"
import CardSubHeader from "@/components/cards/CardSubHeader"
import RoleBanner from "./components/RoleBanner"
import RequestorsDetails from "./components/RequestorsDetails"
export default function ViewProfilePane() {
  return (
    <GeneralCard>
        <div className="grid gap-5">
            <div>
                <CardSubHeader className='text-gray-600'>Requestor's Profile</CardSubHeader>
            </div>
            <div className="flex flex-col gap-3 items-center justify-center">
                <UsersProfile/>
                <RoleBanner/>
            </div>
            <div>
                <RequestorsDetails/>
            </div>
        </div>
    </GeneralCard>
  )
}
